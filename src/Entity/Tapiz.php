<?php

namespace App\Entity;

use App\Repository\TapizRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TapizRepository::class)]
class Tapiz
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private ?string $titulo = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $precio = null;

    #[ORM\Column]
    private ?int $stock = null;

    #[ORM\Column(length: 100)]
    private ?string $tecnica = null;

    #[ORM\Column(length: 50)]
    private ?string $medidas = null;

    #[ORM\Column(length: 200, nullable: true)]
    private ?string $materiales = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $fechaElaboracion = null;

    #[ORM\Column(length: 150, nullable: true)]
    private ?string $lugarElaboracion = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $imagen = null;

    #[ORM\Column]
    private ?bool $disponible = null;

    #[ORM\Column]
    private ?\DateTime $fechaCreacion = null;

    #[ORM\ManyToOne(inversedBy: 'tapices')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Coleccion $coleccion = null;

    /**
     * @var Collection<int, CarritoItem>
     */
    #[ORM\OneToMany(targetEntity: CarritoItem::class, mappedBy: 'tapiz', orphanRemoval: true)]
    private Collection $carritoItems;

    /**
     * @var Collection<int, DetallePedido>
     */
    #[ORM\OneToMany(targetEntity: DetallePedido::class, mappedBy: 'tapiz')]
    private Collection $detallePedidos;

    public function __construct()
    {
        $this->carritoItems = new ArrayCollection();
        $this->detallePedidos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitulo(): ?string
    {
        return $this->titulo;
    }

    public function setTitulo(string $titulo): static
    {
        $this->titulo = $titulo;

        return $this;
    }

    public function getPrecio(): ?string
    {
        return $this->precio;
    }

    public function setPrecio(string $precio): static
    {
        $this->precio = $precio;

        return $this;
    }

    public function getStock(): ?int
    {
        return $this->stock;
    }

    public function setStock(int $stock): static
    {
        $this->stock = $stock;

        return $this;
    }

    public function getTecnica(): ?string
    {
        return $this->tecnica;
    }

    public function setTecnica(string $tecnica): static
    {
        $this->tecnica = $tecnica;

        return $this;
    }

    public function getMedidas(): ?string
    {
        return $this->medidas;
    }

    public function setMedidas(string $medidas): static
    {
        $this->medidas = $medidas;

        return $this;
    }

    public function getMateriales(): ?string
    {
        return $this->materiales;
    }

    public function setMateriales(?string $materiales): static
    {
        $this->materiales = $materiales;

        return $this;
    }

    public function getFechaElaboracion(): ?\DateTime
    {
        return $this->fechaElaboracion;
    }

    public function setFechaElaboracion(?\DateTime $fechaElaboracion): static
    {
        $this->fechaElaboracion = $fechaElaboracion;

        return $this;
    }

    public function getLugarElaboracion(): ?string
    {
        return $this->lugarElaboracion;
    }

    public function setLugarElaboracion(?string $lugarElaboracion): static
    {
        $this->lugarElaboracion = $lugarElaboracion;

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

    public function getImagen(): ?string 
    { 
        return $this->imagen; 
    }
    
    public function setImagen(?string $imagen): static 
    { 
        $this->imagen = $imagen; 
        return $this; 
    }

    public function isDisponible(): ?bool
    {
        return $this->disponible;
    }

    public function setDisponible(bool $disponible): static
    {
        $this->disponible = $disponible;

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

    public function getColeccion(): ?Coleccion
    {
        return $this->coleccion;
    }

    public function setColeccion(?Coleccion $coleccion): static
    {
        $this->coleccion = $coleccion;

        return $this;
    }

    /**
     * @return Collection<int, CarritoItem>
     */
    public function getCarritoItems(): Collection
    {
        return $this->carritoItems;
    }

    public function addCarritoItem(CarritoItem $carritoItem): static
    {
        if (!$this->carritoItems->contains($carritoItem)) {
            $this->carritoItems->add($carritoItem);
            $carritoItem->setTapiz($this);
        }

        return $this;
    }

    public function removeCarritoItem(CarritoItem $carritoItem): static
    {
        if ($this->carritoItems->removeElement($carritoItem)) {
            // set the owning side to null (unless already changed)
            if ($carritoItem->getTapiz() === $this) {
                $carritoItem->setTapiz(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, DetallePedido>
     */
    public function getDetallePedidos(): Collection
    {
        return $this->detallePedidos;
    }

    public function addDetallePedido(DetallePedido $detallePedido): static
    {
        if (!$this->detallePedidos->contains($detallePedido)) {
            $this->detallePedidos->add($detallePedido);
            $detallePedido->setTapiz($this);
        }

        return $this;
    }

    public function removeDetallePedido(DetallePedido $detallePedido): static
    {
        if ($this->detallePedidos->removeElement($detallePedido)) {
            // set the owning side to null (unless already changed)
            if ($detallePedido->getTapiz() === $this) {
                $detallePedido->setTapiz(null);
            }
        }

        return $this;
    }
}
