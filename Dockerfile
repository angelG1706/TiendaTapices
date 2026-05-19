FROM php:8.4-cli

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libonig-dev libxml2-dev openssl \
    && docker-php-ext-install intl pdo pdo_mysql opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

COPY . .

RUN mkdir -p config/jwt && \
    openssl genpkey -algorithm RSA -out config/jwt/private.pem -pkeyopt rsa_keygen_bits:4096 && \
    openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]