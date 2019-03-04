# Meme
A Web API that uses [Intervention](https://intervention.io) & [Guzzle](https://github.com/guzzle/guzzle) to generate some memes.

# Hosting
## Global
* [php 7 >=](http://php.net/downloads.php)
* imagemagick | [Windows](https://mlocati.github.io/articles/php-windows-imagick.html) / Linux; It should be in your package manager of choice, or compile from source
* imagick php extension | [Windows](https://mlocati.github.io/articles/php-windows-imagick.html) / Linux; Same as above

## IIS - Windows
### Requirements
* [PHPManager for IIS](https://www.phpmanager.xyz/)
* [URLRewrite](https://www.iis.net/downloads/microsoft/url-rewrite)

## Apache - Windows / Linux
### Requirements:
* Mod-Rewrite

## Errors
### `cURL error 60: SSL certificate problem: unable to get local issuer certificate`

[This S.O Answer should fix the problem](https://stackoverflow.com/a/31830614)