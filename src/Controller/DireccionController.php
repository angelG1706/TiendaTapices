<?php

namespace App\Controller;

use App\Entity\Direccion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class DireccionController extends AbstractController
{
    #[Route('/api/direcciones', name: 'api_direcciones_listar', methods: ['GET'])]
    public function listar(EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $direcciones = $em->getRepository(Direccion::class)->findBy(['usuario' => $usuario]);

        $data = array_map(fn($d) => [
            'id' => $d->getId(),
            'calle' => $d->getCalle(),
            'colonia' => $d->getColonia(),
            'ciudad' => $d->getCiudad(),
            'estado' => $d->getEstado(),
            'codigo_postal' => $d->getCodigoPostal(),
            'pais' => $d->getPais(),
            'predeterminada' => $d->isPredeterminada(),
        ], $direcciones);

        return $this->json($data);
    }

    #[Route('/api/direcciones', name: 'api_direcciones_crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        if (!isset($datos['calle'], $datos['colonia'], $datos['ciudad'], $datos['estado'], $datos['codigo_postal'], $datos['pais'])) {
            return $this->json(['error' => 'Faltan campos obligatorios'], 400);
        }

        $usuario = $this->getUser();

        if (!empty($datos['predeterminada'])) {
            $existentes = $em->getRepository(Direccion::class)->findBy(['usuario' => $usuario]);
            foreach ($existentes as $d) {
                $d->setPredeterminada(false);
            }
        }

        $direccion = new Direccion();
        $direccion->setUsuario($usuario);
        $direccion->setCalle($datos['calle']);
        $direccion->setColonia($datos['colonia']);
        $direccion->setCiudad($datos['ciudad']);
        $direccion->setEstado($datos['estado']);
        $direccion->setCodigoPostal($datos['codigo_postal']);
        $direccion->setPais($datos['pais']);
        $direccion->setPredeterminada($datos['predeterminada'] ?? false);

        $em->persist($direccion);
        $em->flush();

        return $this->json(['mensaje' => 'Dirección creada correctamente', 'id' => $direccion->getId()], 201);
    }

    #[Route('/api/direcciones/{id}', name: 'api_direcciones_eliminar', methods: ['DELETE'])]
    public function eliminar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $this->getUser();
        $direccion = $em->getRepository(Direccion::class)->findOneBy([
            'id' => $id,
            'usuario' => $usuario,
        ]);

        if (!$direccion) {
            return $this->json(['error' => 'Dirección no encontrada'], 404);
        }

        $em->remove($direccion);
        $em->flush();

        return $this->json(['mensaje' => 'Dirección eliminada correctamente']);
    }
}