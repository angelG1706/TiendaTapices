<?php

namespace App\Command;

use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:crear-admin',
    description: 'Crea el primer usuario administrador',
)]
class CrearAdminCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $helper = $this->getHelper('question');

        $output->writeln('<info>Crear nuevo administrador</info>');

        $nombreQ = new Question('Nombre: ');
        $nombre = $helper->ask($input, $output, $nombreQ);

        $emailQ = new Question('Email: ');
        $email = $helper->ask($input, $output, $emailQ);

        $passwordQ = new Question('Password: ');
        $passwordQ->setHidden(true);
        $password = $helper->ask($input, $output, $passwordQ);

        $existente = $this->em->getRepository(Usuario::class)->findOneBy(['email' => $email]);
        if ($existente) {
            $output->writeln('<error>Ya existe un usuario con ese email.</error>');
            return Command::FAILURE;
        }

        $usuario = new Usuario();
        $usuario->setNombre($nombre);
        $usuario->setEmail($email);
        $usuario->setRol('admin');
        $usuario->setFechaCreacion(new \DateTime());

        $passwordHasheado = $this->passwordHasher->hashPassword($usuario, $password);
        $usuario->setPasswordHash($passwordHasheado);

        $this->em->persist($usuario);
        $this->em->flush();

        $output->writeln('<info>Administrador creado correctamente.</info>');

        return Command::SUCCESS;
    }
}