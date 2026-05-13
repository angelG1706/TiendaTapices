<?php

namespace App\Controller;

use App\Entity\CarritoItem;
use App\Entity\Direccion;
use App\Entity\DetallePedido;
use App\Entity\Pedido;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Conekta\Api\OrdersApi;
use Conekta\Configuration;
use Conekta\Model\OrderRequest;
use Conekta\Model\OrderRequestCustomerInfo;
use Conekta\Model\Product;
use Conekta\Model\ChargeRequest;
use Conekta\Model\ChargeRequestPaymentMethod;
use Conekta\Model\PaymentMethodCashRequest;
use Conekta\Model\PaymentMethodSpeiRequest;
use Conekta\Model\PaymentMethodCardRequest;
use App\Service\PaypalService;

class PagoController extends AbstractController
{
    // ── Helpers ─────────────────────────────────────────────────────────────

    private function crearOrderApi(): OrdersApi
    {
        $config = Configuration::getDefaultConfiguration()
            ->setAccessToken($_ENV['CONEKTA_API_KEY']);
        return new OrdersApi(null, $config);
    }

    /**
     * Crea un Pedido a partir del carrito y la dirección.
     * También construye $lineItems en memoria durante el loop,
     * evitando problemas de lazy loading de Doctrine.
     */
    private function crearPedidoDesdeCarrito(
        int $direccionId,
        EntityManagerInterface $em,
        ?string &$error = null,
        array &$lineItems = []
    ): ?Pedido {
        $usuario = $this->getUser();

        $direccion = $em->getRepository(Direccion::class)->findOneBy([
            'id'      => $direccionId,
            'usuario' => $usuario,
        ]);

        if (!$direccion) {
            $error = 'Dirección no encontrada';
            return null;
        }

        $items = $em->createQuery(
            'SELECT ci FROM App\Entity\CarritoItem ci WHERE ci.usuario = :usuario'
        )->setParameter('usuario', $usuario)->getResult();

        if (empty($items)) {
            $error = 'El carrito está vacío';
            return null;
        }

        $pedido = new Pedido();
        $pedido->setUsuario($usuario);
        $pedido->setDireccion($direccion);
        $pedido->setEstado('pendiente');
        $pedido->setFechaCreacion(new \DateTime());

        $total     = 0;
        $lineItems = [];

        foreach ($items as $item) {
            $tapiz    = $item->getTapiz();
            $cantidad = $item->getCantidad();
            $precio   = $tapiz->getPrecio();

            $detalle = new DetallePedido();
            $detalle->setPedido($pedido);
            $detalle->setTapiz($tapiz);
            $detalle->setCantidad($cantidad);
            $detalle->setPrecioUnitario($precio);
            $em->persist($detalle);

            $total += $precio * $cantidad;

            // Construir lineItems aquí mientras tenemos los datos en memoria
            $lineItems[] = new Product([
                'name'       => $tapiz->getTitulo(),
                'quantity'   => $cantidad,
                'unit_price' => (int) round($precio * 100),
            ]);
        }

        $pedido->setTotal($total);
        $em->persist($pedido);
        $em->flush();

        return $pedido;
    }

    private function construirCustomerInfo($usuario): OrderRequestCustomerInfo
    {
        return new OrderRequestCustomerInfo([
            'name'  => $usuario->getNombre(),
            'email' => $usuario->getEmail(),
            'phone' => '+5212345678901',
        ]);
    }

    private function revertirPedido(Pedido $pedido, EntityManagerInterface $em): void
    {
        $em->createQuery('DELETE FROM App\Entity\DetallePedido dp WHERE dp.pedido = :pedido')
            ->setParameter('pedido', $pedido)
            ->execute();
        $em->remove($pedido);
        $em->flush();
    }

    private function limpiarCarrito(EntityManagerInterface $em): void
    {
        $usuario = $this->getUser();
        $items   = $em->createQuery(
            'SELECT ci FROM App\Entity\CarritoItem ci WHERE ci.usuario = :usuario'
        )->setParameter('usuario', $usuario)->getResult();
        foreach ($items as $item) {
            $em->remove($item);
        }
        $em->flush();
    }

    private function reducirStock(Pedido $pedido, EntityManagerInterface $em): void
    {
        $detalles = $em->createQuery(
            'SELECT dp, t FROM App\Entity\DetallePedido dp JOIN dp.tapiz t WHERE dp.pedido = :pedido'
        )->setParameter('pedido', $pedido)->getResult();

        foreach ($detalles as $detalle) {
            $tapiz      = $detalle->getTapiz();
            $nuevoStock = $tapiz->getStock() - $detalle->getCantidad();
            $tapiz->setStock(max(0, $nuevoStock));
            if ($nuevoStock <= 0) {
                $tapiz->setDisponible(false);
            }
        }
        $em->flush();
    }

    // ── OXXO ────────────────────────────────────────────────────────────────

    #[Route('/api/pagos/oxxo', name: 'api_pago_oxxo', methods: ['POST'])]
    public function generarOxxo(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos       = json_decode($request->getContent(), true);
        $direccionId = $datos['direccion_id'] ?? null;

        if (!$direccionId) {
            return $this->json(['error' => 'La dirección de envío es obligatoria'], 400);
        }

        $error     = null;
        $lineItems = [];
        $pedido    = $this->crearPedidoDesdeCarrito($direccionId, $em, $error, $lineItems);

        if (!$pedido) {
            return $this->json(['error' => $error], 400);
        }

        try {
            $orderRequest = new OrderRequest([
                'currency'      => 'MXN',
                'customer_info' => $this->construirCustomerInfo($this->getUser()),
                'line_items'    => $lineItems,
                'charges'       => [
                    new ChargeRequest([
                        'payment_method' => new PaymentMethodCashRequest([
                            'type'       => 'cash',
                            'expires_at' => (new \DateTime('+3 days'))->getTimestamp(),
                        ]),
                    ]),
                ],
            ]);

            $order      = $this->crearOrderApi()->createOrder($orderRequest);
            $referencia = $order->getCharges()->getData()[0]->getPaymentMethod()->getReference();

            $pedido->setReferenciaPago($referencia);
            $this->limpiarCarrito($em);
            $em->flush();

            return $this->json([
                'metodo'     => 'OXXO',
                'referencia' => $referencia,
                'total'      => $pedido->getTotal(),
                'pedido_id'  => $pedido->getId(),
                'expira'     => (new \DateTime('+3 days'))->format('Y-m-d'),
            ]);

        } catch (\Exception $e) {
            $this->revertirPedido($pedido, $em);
            return $this->json(['error' => 'Error al generar referencia OXXO', 'detalle' => $e->getMessage()], 500);
        }
    }

    // ── SPEI ─────────────────────────────────────────────────────────────────

    #[Route('/api/pagos/spei', name: 'api_pago_spei', methods: ['POST'])]
    public function generarSpei(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos       = json_decode($request->getContent(), true);
        $direccionId = $datos['direccion_id'] ?? null;

        if (!$direccionId) {
            return $this->json(['error' => 'La dirección de envío es obligatoria'], 400);
        }

        $error     = null;
        $lineItems = [];
        $pedido    = $this->crearPedidoDesdeCarrito($direccionId, $em, $error, $lineItems);

        if (!$pedido) {
            return $this->json(['error' => $error], 400);
        }

        try {
            $orderRequest = new OrderRequest([
                'currency'      => 'MXN',
                'customer_info' => $this->construirCustomerInfo($this->getUser()),
                'line_items'    => $lineItems,
                'charges'       => [
                    new ChargeRequest([
                        'payment_method' => new PaymentMethodSpeiRequest([
                            'type'       => 'spei',
                            'expires_at' => (new \DateTime('+3 days'))->getTimestamp(),
                        ]),
                    ]),
                ],
            ]);

            $order         = $this->crearOrderApi()->createOrder($orderRequest);
            $charge        = $order->getCharges()->getData()[0];
            $paymentMethod = $charge->getPaymentMethod();

            $pedido->setReferenciaPago($order->getId());
            $this->limpiarCarrito($em);
            $em->flush();

            return $this->json([
                'metodo'    => 'SPEI',
                'clabe'     => $paymentMethod->getClabeDestination(),
                'banco'     => $paymentMethod->getReceivingAccountBank(),
                'total'     => $pedido->getTotal(),
                'pedido_id' => $pedido->getId(),
                'expira'    => (new \DateTime('+3 days'))->format('Y-m-d'),
            ]);

        } catch (\Exception $e) {
            $this->revertirPedido($pedido, $em);
            return $this->json(['error' => 'Error al generar CLABE SPEI', 'detalle' => $e->getMessage()], 500);
        }
    }

    // ── TARJETA ──────────────────────────────────────────────────────────────

    #[Route('/api/pagos/tarjeta', name: 'api_pago_tarjeta', methods: ['POST'])]
    public function generarTarjeta(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos       = json_decode($request->getContent(), true);
        $direccionId = $datos['direccion_id'] ?? null;
        $tokenId     = $datos['token_id']     ?? null;

        if (!$direccionId) {
            return $this->json(['error' => 'La dirección de envío es obligatoria'], 400);
        }
        if (!$tokenId) {
            return $this->json(['error' => 'Falta el token de la tarjeta'], 400);
        }

        $error     = null;
        $lineItems = [];
        $pedido    = $this->crearPedidoDesdeCarrito($direccionId, $em, $error, $lineItems);

        if (!$pedido) {
            return $this->json(['error' => $error], 400);
        }

        try {
            $orderRequest = new OrderRequest([
                'currency'      => 'MXN',
                'customer_info' => $this->construirCustomerInfo($this->getUser()),
                'line_items'    => $lineItems,
                'charges'       => [
                    new ChargeRequest([
                        'payment_method' => new ChargeRequestPaymentMethod([
                            'type'     => 'card',
                            'token_id' => $tokenId,
                        ]),
                    ]),
                ],
            ]);

            $order  = $this->crearOrderApi()->createOrder($orderRequest);
            $charge = $order->getCharges()->getData()[0];

            $pedido->setReferenciaPago($order->getId());
            $pedido->setEstado('pagado');
            $this->reducirStock($pedido, $em);
            $this->limpiarCarrito($em);
            $em->flush();

            return $this->json([
                'metodo'    => 'Tarjeta',
                'estado'    => $charge->getStatus(),
                'total'     => $pedido->getTotal(),
                'pedido_id' => $pedido->getId(),
                'order_id'  => $order->getId(),
            ]);

        } catch (\Exception $e) {
            $this->revertirPedido($pedido, $em);
            return $this->json(['error' => 'Error al procesar el pago con tarjeta', 'detalle' => $e->getMessage()], 500);
        }
    }

    // ── PAYPAL — Crear orden ─────────────────────────────────────────────────

    #[Route('/api/pagos/paypal', name: 'api_pago_paypal_crear', methods: ['POST'])]
    public function crearOrdenPaypal(
        Request $request,
        EntityManagerInterface $em,
        PaypalService $paypal
    ): JsonResponse {
        $datos       = json_decode($request->getContent(), true);
        $direccionId = $datos['direccion_id'] ?? null;

        if (!$direccionId) {
            return $this->json(['error' => 'La dirección de envío es obligatoria'], 400);
        }

        $error     = null;
        $lineItems = [];
        $pedido    = $this->crearPedidoDesdeCarrito($direccionId, $em, $error, $lineItems);

        if (!$pedido) {
            return $this->json(['error' => $error], 400);
        }

        $orden = $paypal->crearOrden($pedido->getTotal());

        if (!isset($orden['id'])) {
            $this->revertirPedido($pedido, $em);
            return $this->json(['error' => 'No se pudo crear la orden de PayPal'], 500);
        }

        return $this->json([
            'paypal_order_id' => $orden['id'],
            'pedido_id'       => $pedido->getId(),
            'status'          => $orden['status'],
        ]);
    }

    // ── PAYPAL — Capturar pago ───────────────────────────────────────────────

    #[Route('/api/pagos/paypal/{pedidoId}/capturar', name: 'api_pago_paypal_capturar', methods: ['POST'])]
    public function capturarPagoPaypal(
        int $pedidoId,
        Request $request,
        EntityManagerInterface $em,
        PaypalService $paypal
    ): JsonResponse {
        $usuario = $this->getUser();
        $pedido  = $em->getRepository(Pedido::class)->findOneBy([
            'id'      => $pedidoId,
            'usuario' => $usuario,
        ]);

        if (!$pedido) {
            return $this->json(['error' => 'Pedido no encontrado'], 404);
        }

        $datos         = json_decode($request->getContent(), true);
        $paypalOrderId = $datos['paypal_order_id'] ?? null;

        if (!$paypalOrderId) {
            return $this->json(['error' => 'Falta el paypal_order_id'], 400);
        }

        $resultado = $paypal->capturarOrden($paypalOrderId);

        if (($resultado['status'] ?? '') !== 'COMPLETED') {
            return $this->json(['error' => 'El pago no fue completado'], 400);
        }

        $pedido->setReferenciaPago($paypalOrderId);
        $pedido->setEstado('pagado');
        $this->reducirStock($pedido, $em);
        $this->limpiarCarrito($em);
        $em->flush();

        return $this->json([
            'metodo'    => 'PayPal',
            'estado'    => 'pagado',
            'total'     => $pedido->getTotal(),
            'pedido_id' => $pedido->getId(),
            'order_id'  => $paypalOrderId,
        ]);
    }

    // ── WEBHOOK ──────────────────────────────────────────────────────────────

    #[Route('/api/pagos/webhook', name: 'api_pago_webhook', methods: ['POST'])]
    public function webhook(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        if (!isset($payload['type'])) {
            return $this->json(['ok' => true]);
        }

        if (in_array($payload['type'], ['order.paid', 'charge.paid'])) {
            $referencia = $payload['data']['object']['charges']['data'][0]['payment_method']['reference']
                ?? $payload['data']['object']['id']
                ?? null;

            if ($referencia) {
                $pedido = $em->getRepository(Pedido::class)->findOneBy(['referenciaPago' => $referencia]);
                if ($pedido && $pedido->getEstado() === 'pendiente') {
                    $pedido->setEstado('pagado');
                    $this->reducirStock($pedido, $em);
                    $em->flush();
                }
            }
        }

        return $this->json(['ok' => true]);
    }
}