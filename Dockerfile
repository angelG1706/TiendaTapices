FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libonig-dev libxml2-dev \
    && docker-php-ext-install intl pdo pdo_mysql opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

COPY . .

RUN php bin/console cache:clear --env=prod --no-debug
RUN php bin/console assets:install public --env=prod

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]