<?php

namespace App\Entity;

use App\Repository\ColeccionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ColeccionRepository::class)]
class Coleccion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column]
    private ?\DateTime $fechaCreacion = null;

    /**
     * @var Collection<int, Tapiz>
     */
    #[ORM\OneToMany(targetEntity: Tapiz::class, mappedBy: 'coleccion')]
    private Collection $tapices;

    public function __construct()
    {
        $this->tapices = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;

        return $this;
    }

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(?string $descripcion): static
    {
        $this->descripcion = $descripcion;

        return $this;
    }

    public function getFechaCreacion(): ?\DateTime
    {
        return $this->fechaCreacion;
    }

    public function setFechaCreacion(\DateTime $fechaCreacion): static
    {
        $this->fechaCreacion = $fechaCreacion;

        return $this;
    }

    /**
     * @return Collection<int, Tapiz>
     */
    public function getTapices(): Collection
    {
        return $this->tapices;
    }

    public function addTapice(Tapiz $tapice): static
    {
        if (!$this->tapices->contains($tapice)) {
            $this->tapices->add($tapice);
            $tapice->setColeccion($this);
        }

        return $this;
    }

    public function removeTapice(Tapiz $tapice): static
    {
        if ($this->tapices->removeElement($tapice)) {
            // set the owning side to null (unless already changed)
            if ($tapice->getColeccion() === $this) {
                $tapice->setColeccion(null);
            }
        }

        return $this;
    }
}
