<?php

namespace App\Controller;

use App\Entity\CarritoItem;
use App\Entity\Tapiz;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class CarritoController extends AbstractController
{
    #[Route('/api/carrito', name: 'api_carrito_ver', methods: ['GET'])]
    public function ver(EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $items = $em->getRepository(CarritoItem::class)->findBy(['usuario' => $usuario]);

        $data = array_map(fn($item) => [
            'id'       => $item->getId(),
            'tapiz_id' => $item->getTapiz()->getId(),
            'titulo'   => $item->getTapiz()->getTitulo(),
            'precio'   => $item->getTapiz()->getPrecio(),
            'cantidad' => $item->getCantidad(),
            'subtotal' => $item->getTapiz()->getPrecio() * $item->getCantidad(),
            'imagen'   => $item->getTapiz()->getImagen(),
            'tecnica'  => $item->getTapiz()->getTecnica(),
            'medidas'  => $item->getTapiz()->getMedidas(),
        ], $items);

        $total = array_sum(array_column($data, 'subtotal'));

        return $this->json(['items' => $data, 'total' => $total]);
    }

    #[Route('/api/carrito', name: 'api_carrito_agregar', methods: ['POST'])]
    public function agregar(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        if (!isset($datos['tapiz_id'], $datos['cantidad'])) {
            return $this->json(['error' => 'Faltan campos obligatorios'], 400);
        }

        $tapiz = $em->getRepository(Tapiz::class)->find($datos['tapiz_id']);
        if (!$tapiz) {
            return $this->json(['error' => 'Tapiz no encontrado'], 404);
        }

        if (!$tapiz->isDisponible() || $tapiz->getStock() < $datos['cantidad']) {
            return $this->json(['error' => 'Stock insuficiente'], 400);
        }

        $usuario = $this->getUser();

        $itemExistente = $em->getRepository(CarritoItem::class)->findOneBy([
            'usuario' => $usuario,
            'tapiz' => $tapiz,
        ]);

        if ($itemExistente) {
            $itemExistente->setCantidad($itemExistente->getCantidad() + $datos['cantidad']);
            $itemExistente->setUpdatedAt(new \DateTime());
        } else {
            $item = new CarritoItem();
            $item->setUsuario($usuario);
            $item->setTapiz($tapiz);
            $item->setCantidad($datos['cantidad']);
            $item->setUpdatedAt(new \DateTime());
            $em->persist($item);
        }

        $em->flush();

        return $this->json(['mensaje' => 'Tapiz agregado al carrito'], 201);
    }

    #[Route('/api/carrito/{id}', name: 'api_carrito_eliminar', methods: ['DELETE'])]
    public function eliminar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $item = $em->getRepository(CarritoItem::class)->findOneBy([
            'id' => $id,
            'usuario' => $usuario,
        ]);

        if (!$item) {
            return $this->json(['error' => 'Item no encontrado'], 404);
        }

        $em->remove($item);
        $em->flush();

        return $this->json(['mensaje' => 'Item eliminado del carrito']);
    }

    #[Route('/api/carrito', name: 'api_carrito_limpiar', methods: ['DELETE'])]
    public function limpiar(EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $items = $em->getRepository(CarritoItem::class)->findBy(['usuario' => $usuario]);

        foreach ($items as $item) {
            $em->remove($item);
        }

        $em->flush();

        return $this->json(['mensaje' => 'Carrito vaciado correctamente']);
    }
}