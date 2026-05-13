<?php

namespace App\Controller;

use App\Entity\Coleccion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ColeccionController extends AbstractController
{
    #[Route('/api/colecciones', name: 'api_colecciones_listar', methods: ['GET'])]
    public function listar(EntityManagerInterface $em): JsonResponse
    {
        $colecciones = $em->getRepository(Coleccion::class)->findAll();

        $data = array_map(fn($c) => [
            'id' => $c->getId(),
            'nombre' => $c->getNombre(),
            'descripcion' => $c->getDescripcion(),
            'fecha_creacion' => $c->getFechaCreacion()?->format('Y-m-d H:i:s'),
        ], $colecciones);

        return $this->json($data);
    }

    #[Route('/api/colecciones', name: 'api_colecciones_crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        if (!isset($datos['nombre'])) {
            return $this->json(['error' => 'El nombre es obligatorio'], 400);
        }

        $coleccion = new Coleccion();
        $coleccion->setNombre($datos['nombre']);
        $coleccion->setDescripcion($datos['descripcion'] ?? null);
        $coleccion->setFechaCreacion(new \DateTime());

        $em->persist($coleccion);
        $em->flush();

        return $this->json([
            'mensaje' => 'Colección creada correctamente',
            'coleccion' => [
                'id' => $coleccion->getId(),
                'nombre' => $coleccion->getNombre(),
                'descripcion' => $coleccion->getDescripcion(),
            ]
        ], 201);
    }

    #[Route('/api/colecciones/{id}', name: 'api_colecciones_editar', methods: ['PUT'])]
    public function editar(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $coleccion = $em->getRepository(Coleccion::class)->find($id);

        if (!$coleccion) {
            return $this->json(['error' => 'Colección no encontrada'], 404);
        }

        $datos = json_decode($request->getContent(), true);

        if (isset($datos['nombre'])) {
            $coleccion->setNombre($datos['nombre']);
        }
        if (array_key_exists('descripcion', $datos)) {
            $coleccion->setDescripcion($datos['descripcion']);
        }

        $em->flush();

        return $this->json([
            'mensaje' => 'Colección actualizada correctamente',
            'coleccion' => [
                'id' => $coleccion->getId(),
                'nombre' => $coleccion->getNombre(),
                'descripcion' => $coleccion->getDescripcion(),
            ]
        ]);
    }

    #[Route('/api/colecciones/{id}', name: 'api_colecciones_eliminar', methods: ['DELETE'])]
    public function eliminar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $coleccion = $em->getRepository(Coleccion::class)->find($id);

        if (!$coleccion) {
            return $this->json(['error' => 'Colección no encontrada'], 404);
        }

        $em->remove($coleccion);
        $em->flush();

        return $this->json(['mensaje' => 'Colección eliminada correctamente']);
    }
}