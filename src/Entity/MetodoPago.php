<?php

namespace App\Entity;

use App\Repository\MetodoPagoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MetodoPagoRepository::class)]
class MetodoPago
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $tipo = null;

    #[ORM\Column(length: 4)]
    private ?string $ultimos4 = null;

    #[ORM\Column(length: 255)]
    private ?string $tokenPasarela = null;

    #[ORM\Column]
    private ?bool $predeterminado = null;

    #[ORM\ManyToOne(inversedBy: 'metodoPagos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): static
    {
        $this->tipo = $tipo;

        return $this;
    }

    public function getUltimos4(): ?string
    {
        return $this->ultimos4;
    }

    public function setUltimos4(string $ultimos4): static
    {
        $this->ultimos4 = $ultimos4;

        return $this;
    }

    public function getTokenPasarela(): ?string
    {
        return $this->tokenPasarela;
    }

    public function setTokenPasarela(string $tokenPasarela): static
    {
        $this->tokenPasarela = $tokenPasarela;

        return $this;
    }

    public function isPredeterminado(): ?bool
    {
        return $this->predeterminado;
    }

    public function setPredeterminado(bool $predeterminado): static
    {
        $this->predeterminado = $predeterminado;

        return $this;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }
}
