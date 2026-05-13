<?php

namespace App\Controller;

use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class RegistroController extends AbstractController
{
    #[Route('/api/registro', name: 'api_registro', methods: ['POST'])]
    public function registro(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $datos = json_decode($request->getContent(), true);

        if (!isset($datos['nombre'], $datos['email'], $datos['password'])) {
            return $this->json([
                'error' => 'Faltan campos obligatorios'
            ], 400);
        }

        $usuarioExistente = $em->getRepository(Usuario::class)->findOneBy([
            'email' => $datos['email']
        ]);

        if ($usuarioExistente) {
            return $this->json([
                'error' => 'El email ya está registrado'
            ], 409);
        }

        $usuario = new Usuario();
        $usuario->setNombre($datos['nombre']);
        $usuario->setEmail($datos['email']);
        $usuario->setRol('cliente');
        $usuario->setFechaCreacion(new \DateTime());

        $passwordHasheada = $passwordHasher->hashPassword($usuario, $datos['password']);
        $usuario->setPasswordHash($passwordHasheada);

        $em->persist($usuario);
        $em->flush();

        return $this->json([
            'mensaje' => 'Usuario registrado correctamente',
            'usuario' => [
                'id' => $usuario->getId(),
                'nombre' => $usuario->getNombre(),
                'email' => $usuario->getEmail(),
                'rol' => $usuario->getRol()
            ]
        ], 201);
    }
}