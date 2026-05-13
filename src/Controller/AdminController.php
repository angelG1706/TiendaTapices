<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Entity\Pedido;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class AdminController extends AbstractController
{
    // Slots permitidos y su carpeta de destino dentro de frontend/public/imagenes/
    private const SLOTS = [
        'hero'    => 'imagenes/hero',
        'artista' => 'imagenes/artista',
    ];

    private function frontendPublic(): string
    {
        return $this->getParameter('kernel.project_dir') . '/frontend/public';
    }

    // ── Usuarios ────────────────────────────────────────────────────────────

    #[Route('/api/admin/usuarios', name: 'api_admin_usuarios', methods: ['GET'])]
    public function listarUsuarios(EntityManagerInterface $em): JsonResponse
    {
        $usuarios = $em->getRepository(Usuario::class)->findAll();
        $data = array_map(fn($u) => [
            'id'             => $u->getId(),
            'nombre'         => $u->getNombre(),
            'email'          => $u->getEmail(),
            'rol'            => $u->getRol(),
            'fecha_creacion' => $u->getFechaCreacion()?->format('Y-m-d H:i:s'),
        ], $usuarios);
        return $this->json($data);
    }

    #[Route('/api/admin/usuarios', name: 'api_admin_crear_usuario', methods: ['POST'])]
    public function crearUsuario(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        $existente = $em->getRepository(Usuario::class)->findOneBy(['email' => $datos['email']]);
        if ($existente) {
            return $this->json(['error' => 'Ya existe un usuario con ese email'], 400);
        }

        $usuario = new Usuario();
        $usuario->setNombre($datos['nombre']);
        $usuario->setEmail($datos['email']);
        $usuario->setRol($datos['rol'] ?? 'cliente');
        $usuario->setFechaCreacion(new \DateTime());
        $usuario->setPasswordHash($hasher->hashPassword($usuario, $datos['password']));

        $em->persist($usuario);
        $em->flush();

        return $this->json(['mensaje' => 'Usuario creado correctamente'], 201);
    }

    // ── Pedidos ─────────────────────────────────────────────────────────────

    #[Route('/api/admin/pedidos', name: 'api_admin_pedidos', methods: ['GET'])]
    public function listarPedidos(EntityManagerInterface $em): JsonResponse
    {
        $pedidos = $em->getRepository(Pedido::class)->findAll();
        $data = array_map(fn($p) => [
            'id'              => $p->getId(),
            'usuario'         => $p->getUsuario()?->getNombre(),
            'total'           => $p->getTotal(),
            'estado'          => $p->getEstado(),
            'referencia_pago' => $p->getReferenciaPago(),
            'fecha_creacion'  => $p->getFechaCreacion()?->format('Y-m-d H:i:s'),
        ], $pedidos);
        return $this->json($data);
    }

    // ── Imágenes del sitio ──────────────────────────────────────────────────

    /**
     * GET /api/admin/imagenes-sitio
     * Devuelve las rutas actuales de cada slot (lo que hay en disco).
     */
    #[Route('/api/admin/imagenes-sitio', name: 'api_admin_imagenes_sitio_get', methods: ['GET'])]
    public function obtenerImagenesSitio(): JsonResponse
    {
        $base = $this->frontendPublic();
        $resultado = [];

        foreach (self::SLOTS as $slot => $carpetaRelativa) {
            $carpeta = $base . '/' . $carpetaRelativa;
            $archivo = $this->buscarArchivoEnCarpeta($carpeta);
            $resultado[$slot] = $archivo
                ? '/' . $carpetaRelativa . '/' . $archivo
                : null;
        }

        return $this->json($resultado);
    }

    /**
     * POST /api/admin/imagen-sitio
     * Sube una imagen para un slot (hero|artista).
     * Borra los archivos anteriores del slot y guarda el nuevo con su extensión real.
     */
    #[Route('/api/admin/imagen-sitio', name: 'api_admin_imagen_sitio_post', methods: ['POST'])]
    public function actualizarImagenSitio(Request $request): JsonResponse
    {
        $archivo = $request->files->get('imagen');
        $slot    = $request->request->get('slot'); // 'hero' o 'artista'

        if (!$archivo) {
            return $this->json(['error' => 'No se recibió ningún archivo'], 400);
        }

        if (!array_key_exists($slot, self::SLOTS)) {
            return $this->json(['error' => 'Slot no válido. Usa: ' . implode(', ', array_keys(self::SLOTS))], 400);
        }

        // Validar tipo MIME
        $tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
        $mime = $archivo->getMimeType();
        if (!in_array($mime, $tiposPermitidos)) {
            return $this->json(['error' => 'Solo se permiten imágenes JPG, PNG o WebP'], 400);
        }

        $carpetaRelativa = self::SLOTS[$slot];
        $carpeta = $this->frontendPublic() . '/' . $carpetaRelativa;

        // Crear carpeta si no existe
        if (!is_dir($carpeta)) {
            mkdir($carpeta, 0755, true);
        }

        // Borrar archivos anteriores del slot (para no acumular)
        foreach (glob($carpeta . '/*') as $viejo) {
            if (is_file($viejo)) {
                unlink($viejo);
            }
        }

        // Guardar con extensión real del archivo subido
        $extension  = $archivo->guessExtension() ?? 'jpg';
        $nombreFinal = $slot . '.' . $extension;
        $archivo->move($carpeta, $nombreFinal);

        $rutaNueva = '/' . $carpetaRelativa . '/' . $nombreFinal;

        return $this->json([
            'mensaje' => 'Imagen actualizada correctamente',
            'ruta'    => $rutaNueva,
            'slot'    => $slot,
        ]);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function buscarArchivoEnCarpeta(string $carpeta): ?string
    {
        if (!is_dir($carpeta)) {
            return null;
        }
        foreach (['*.jpg', '*.jpeg', '*.png', '*.webp'] as $patron) {
            $archivos = glob($carpeta . '/' . $patron);
            if (!empty($archivos)) {
                return basename($archivos[0]);
            }
        }
        return null;
    }
}