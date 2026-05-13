<?php

namespace App\Controller;

use App\Entity\Pedido;
use App\Entity\DetallePedido;
use App\Entity\CarritoItem;
use App\Entity\Direccion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class PedidoController extends AbstractController
{
    #[Route('/api/pedidos', name: 'api_pedidos_listar', methods: ['GET'])]
    public function listar(EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $pedidos = $em->getRepository(Pedido::class)->findBy(['usuario' => $usuario]);

        $data = array_map(fn($p) => [
            'id' => $p->getId(),
            'estado' => $p->getEstado(),
            'total' => $p->getTotal(),
            'referencia_pago' => $p->getReferenciaPago(),
            'fecha_creacion' => $p->getFechaCreacion()?->format('Y-m-d H:i:s'),
        ], $pedidos);

        return $this->json($data);
    }

    #[Route('/api/pedidos/{id}', name: 'api_pedidos_ver', methods: ['GET'])]
    public function ver(int $id, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $pedido = $em->getRepository(Pedido::class)->findOneBy([
            'id' => $id,
            'usuario' => $usuario,
        ]);

        if (!$pedido) {
            return $this->json(['error' => 'Pedido no encontrado'], 404);
        }

        $detalles = array_map(fn($d) => [
            'tapiz' => $d->getTapiz()->getTitulo(),
            'cantidad' => $d->getCantidad(),
            'precio_unitario' => $d->getPrecioUnitario(),
            'subtotal' => $d->getPrecioUnitario() * $d->getCantidad(),
        ], $pedido->getDetallePedidos()->toArray());

        return $this->json([
            'id' => $pedido->getId(),
            'estado' => $pedido->getEstado(),
            'total' => $pedido->getTotal(),
            'referencia_pago' => $pedido->getReferenciaPago(),
            'fecha_creacion' => $pedido->getFechaCreacion()?->format('Y-m-d H:i:s'),
            'detalles' => $detalles,
        ]);
    }

    #[Route('/api/pedidos', name: 'api_pedidos_crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        if (!isset($datos['direccion_id'])) {
            return $this->json(['error' => 'La dirección de envío es obligatoria'], 400);
        }

        $usuario = $this->getUser();

        $direccion = $em->getRepository(Direccion::class)->findOneBy([
            'id' => $datos['direccion_id'],
            'usuario' => $usuario,
        ]);

        if (!$direccion) {
            return $this->json(['error' => 'Dirección no encontrada'], 404);
        }

        $items = $em->getRepository(CarritoItem::class)->findBy(['usuario' => $usuario]);

        if (empty($items)) {
            return $this->json(['error' => 'El carrito está vacío'], 400);
        }

        $pedido = new Pedido();
        $pedido->setUsuario($usuario);
        $pedido->setDireccion($direccion);
        $pedido->setEstado('pendiente');
        $pedido->setFechaCreacion(new \DateTime());

        $total = 0;

        foreach ($items as $item) {
            $detalle = new DetallePedido();
            $detalle->setPedido($pedido);
            $detalle->setTapiz($item->getTapiz());
            $detalle->setCantidad($item->getCantidad());
            $detalle->setPrecioUnitario($item->getTapiz()->getPrecio());
            $em->persist($detalle);

            $total += $item->getTapiz()->getPrecio() * $item->getCantidad();
            // ✗ NO borramos el carrito aquí — se borra solo cuando el pago sea exitoso
        }

        $pedido->setTotal($total);
        $em->persist($pedido);
        $em->flush();

        return $this->json([
            'mensaje' => 'Pedido creado correctamente',
            'pedido_id' => $pedido->getId(),
            'total' => $total,
        ], 201);
    }

    /**
     * Cancela un pedido pendiente y restaura los items al carrito del usuario.
     */
    #[Route('/api/pedidos/{id}/cancelar', name: 'api_pedidos_cancelar', methods: ['DELETE'])]
    public function cancelar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $pedido = $em->getRepository(Pedido::class)->findOneBy([
            'id' => $id,
            'usuario' => $usuario,
        ]);

        if (!$pedido) {
            return $this->json(['error' => 'Pedido no encontrado'], 404);
        }

        if ($pedido->getEstado() !== 'pendiente') {
            return $this->json(['error' => 'Solo se pueden cancelar pedidos pendientes'], 400);
        }

        // Eliminar el pedido y sus detalles (cascade en la entidad)
        $em->remove($pedido);
        $em->flush();

        return $this->json(['mensaje' => 'Pedido cancelado. El carrito se ha conservado.']);
    }
}