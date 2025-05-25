<?php
require(dirname(__DIR__) . '/env.php');
$apiKey = getenv('OPENWEATHER_API_KEY');

$lat = $_POST['lat'];
$lon = $_POST['lon'];

$url = "https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}";

$c = curl_init();
curl_setopt($c, CURLOPT_URL, $url);
curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($c);
curl_close($c);

echo $response;
