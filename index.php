<?php
$debug = true;
$version = '1.0';
$qs = ($debug || $version) 
    ? '?' . ($version ? 'v='.$version : '') . ($debug ? ($version ? '.' : '').time() : '')
    : '';
?>

<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="ildra.com">
    <title>ildra.com</title>
    <meta property="og:type" content="website">
    <meta property="og:title" content="ildra.com">
    <meta property="og:url" content="https://www.ildra.com">
    <meta property="og:image" content="https://www.ildra.com/assets/img/skyline.jpg">
    <meta property="og:description" content="ildra.com">
    <?php if ($debug === true): ?>
    <script>const debug = true;</script>
    <?php endif; ?>
    <script src="/assets/js/main.js<?php echo $qs; ?>"></script>
    <link rel="stylesheet" type="text/css" href="/assets/css/style.css<?php echo $qs; ?>" />
	</head>
	<body>
    <main></main>
  </body>
</html>
