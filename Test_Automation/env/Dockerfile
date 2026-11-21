FROM php:8.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends mariadb-server && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install mysqli && pecl install xdebug && docker-php-ext-enable xdebug
RUN cp /usr/local/etc/php/php.ini-development /usr/local/etc/php/php.ini
COPY cov.ini /usr/local/etc/php/conf.d/zz-cov.ini
COPY prepend.php append.php /opt/
COPY start.sh /start.sh
RUN chmod +x /start.sh && mkdir -p /cov && chmod 777 /cov
EXPOSE 80
CMD ["/start.sh"]
