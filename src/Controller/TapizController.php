<?php

namespace App\Controller;

use App\Entity\Tapiz;
use App\Entity\Coleccion;
use Cloudinary\Cloudinary;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class TapizController extends AbstractController
{
    private function uploadToCloudinary($archivo): string
    {
        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => $_ENV['CLOUDINARY_CLOUD_NAME'],
                'api_key'    => $_ENV['CLOUDINARY_API_KEY'],
                'api_secret' => $_ENV['CLOUDINARY_API_SECRET'],
            ],
        ]);
        $result = $cloudinary->uploadApi()->upload($archivo->getPathname(), [
            'folder' => 'tapices'
        ]);
        return $result['secure_url'];
    }

    #[Route('/api/tapices', name: 'api_tapices_listar', methods: ['GET'])]
    public function listar(EntityManagerInterface $em): JsonResponse
    {
        $tapices = $em->getRepository(Tapiz::class)->findAll();
        $data = array_map(fn($t) => [
            'id'               => $t->getId(),
            'titulo'           => $t->getTitulo(),
            'precio'           => $t->getPrecio(),
            'stock'            => $t->getStock(),
            'tecnica'          => $t->getTecnica(),
            'medidas'          => $t->getMedidas(),
            'materiales'       => $t->getMateriales(),
            'fecha_elaboracion'=> $t->getFechaElaboracion()?->format('Y-m-d'),
            'lugar_elaboracion'=> $t->getLugarElaboracion(),
            'descripcion'      => $t->getDescripcion(),
            'disponible'       => $t->isDisponible(),
            'coleccion'        => $t->getColeccion()?->getNombre(),
            'coleccion_id'     => $t->getColeccion()?->getId(),
            'imagen'           => $t->getImagen(),
        ], $tapices);
        return $this->json($data);
    }

    #[Route('/api/tapices/{id}', name: 'api_tapices_ver', methods: ['GET'])]
    public function ver(int $id, EntityManagerInterface $em): JsonResponse
    {
        $tapiz = $em->getRepository(Tapiz::class)->find($id);
        if (!$tapiz) {
            return $this->json(['error' => 'Tapiz no encontrado'], 404);
        }
        return $this->json([
            'id'               => $tapiz->getId(),
            'titulo'           => $tapiz->getTitulo(),
            'precio'           => $tapiz->getPrecio(),
            'stock'            => $tapiz->getStock(),
            'tecnica'          => $tapiz->getTecnica(),
            'medidas'          => $tapiz->getMedidas(),
            'materiales'       => $tapiz->getMateriales(),
            'fecha_elaboracion'=> $tapiz->getFechaElaboracion()?->format('Y-m-d'),
            'lugar_elaboracion'=> $tapiz->getLugarElaboracion(),
            'descripcion'      => $tapiz->getDescripcion(),
            'disponible'       => $tapiz->isDisponible(),
            'coleccion'        => $tapiz->getColeccion()?->getNombre(),
            'imagen'           => $tapiz->getImagen(),
        ]);
    }

    #[Route('/api/tapices', name: 'api_tapices_crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = $request->getContentTypeFormat() === 'json'
            ? json_decode($request->getContent(), true)
            : $request->request->all();

        if (!isset($datos['titulo'], $datos['precio'], $datos['stock'], $datos['tecnica'], $datos['medidas'], $datos['coleccion_id'])) {
            return $this->json(['error' => 'Faltan campos obligatorios'], 400);
        }

        $coleccion = $em->getRepository(\App\Entity\Coleccion::class)->find($datos['coleccion_id']);
        if (!$coleccion) {
            return $this->json(['error' => 'Colección no encontrada'], 404);
        }

        $tapiz = new Tapiz();
        $tapiz->setTitulo($datos['titulo']);
        $tapiz->setPrecio($datos['precio']);
        $tapiz->setStock($datos['stock']);
        $tapiz->setTecnica($datos['tecnica']);
        $tapiz->setMedidas($datos['medidas']);
        $tapiz->setColeccion($coleccion);
        $tapiz->setDisponible(
            ($datos['disponible'] ?? true) === true
            || ($datos['disponible'] ?? true) === '1'
            || ($datos['disponible'] ?? true) === 1
        );
        $tapiz->setFechaCreacion(new \DateTime());
        $tapiz->setMateriales($datos['materiales'] ?? null);
        $tapiz->setDescripcion($datos['descripcion'] ?? null);
        $tapiz->setLugarElaboracion($datos['lugar_elaboracion'] ?? null);

        if (isset($datos['fecha_elaboracion'])) {
            $tapiz->setFechaElaboracion(new \DateTime($datos['fecha_elaboracion']));
        }

        if (!empty($datos['imagen_url'])) {
            $tapiz->setImagen($datos['imagen_url']);
        }

        $archivo = $request->files->get('imagen');
        if ($archivo) {
            $tapiz->setImagen($this->uploadToCloudinary($archivo));
        }

        $em->persist($tapiz);
        $em->flush();

        return $this->json(['mensaje' => 'Tapiz creado correctamente', 'id' => $tapiz->getId()], 201);
    }

    #[Route('/api/tapices/{id}/editar', name: 'api_tapices_editar', methods: ['PUT', 'POST'])]
    public function editar(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $tapiz = $em->getRepository(Tapiz::class)->find($id);
        if (!$tapiz) {
            return $this->json(['error' => 'Tapiz no encontrado'], 404);
        }

        $datos = $request->getContentTypeFormat() === 'json'
            ? json_decode($request->getContent(), true)
            : $request->request->all();

        if (isset($datos['titulo']))     $tapiz->setTitulo($datos['titulo']);
        if (isset($datos['precio']))     $tapiz->setPrecio($datos['precio']);
        if (isset($datos['stock']))      $tapiz->setStock($datos['stock']);
        if (isset($datos['tecnica']))    $tapiz->setTecnica($datos['tecnica']);
        if (isset($datos['medidas']))    $tapiz->setMedidas($datos['medidas']);
        if (isset($datos['disponible'])) {
            $tapiz->setDisponible(
                $datos['disponible'] === true || $datos['disponible'] === '1' || $datos['disponible'] === 1
            );
        }
        if (array_key_exists('materiales', $datos))        $tapiz->setMateriales($datos['materiales']);
        if (array_key_exists('descripcion', $datos))       $tapiz->setDescripcion($datos['descripcion']);
        if (array_key_exists('lugar_elaboracion', $datos)) $tapiz->setLugarElaboracion($datos['lugar_elaboracion']);
        if (isset($datos['fecha_elaboracion']))            $tapiz->setFechaElaboracion(new \DateTime($datos['fecha_elaboracion']));

        if (isset($datos['coleccion_id'])) {
            $coleccion = $em->getRepository(\App\Entity\Coleccion::class)->find($datos['coleccion_id']);
            if ($coleccion) $tapiz->setColeccion($coleccion);
        }

        if (!empty($datos['imagen_url'])) {
            $tapiz->setImagen($datos['imagen_url']);
        }

        $archivo = $request->files->get('imagen');
        if ($archivo) {
            $tapiz->setImagen($this->uploadToCloudinary($archivo));
        }

        $em->flush();
        return $this->json(['mensaje' => 'Tapiz actualizado correctamente']);
    }

    #[Route('/api/tapices/{id}', name: 'api_tapices_eliminar', methods: ['DELETE'])]
    public function eliminar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $tapiz = $em->getRepository(Tapiz::class)->find($id);
        if (!$tapiz) {
            return $this->json(['error' => 'Tapiz no encontrado'], 404);
        }
        $em->remove($tapiz);
        $em->flush();
        return $this->json(['mensaje' => 'Tapiz eliminado correctamente']);
    }
}