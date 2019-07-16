<?php
header('Content-Type: application/json');

class EndPoints
{
	var $Name;
	var $RequiredSources;

	public function __construct($n, $rs)
	{
		$this->Name = $n;
		$this->RequiredSources = $rs;
	}
}

$t = file_get_contents(getcwd().'/templates/templates.json');

$templates = json_decode($t);

$availableendpoints = array();

foreach($templates as $t)
{
	array_push($availableendpoints, new EndPoints($t->name, $t->sources));
}

function cmp($a, $b)
{
    return strcmp($a->Name, $b->Name);
}
function cmp2($a, $b)
{
    return strcmp($a->name, $b->name);
}

$example = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]/fun/meme/ahegao/?source1=https://pngimage.net/wp-content/uploads/2018/06/pog-champ-png-3.png";

usort($availableendpoints, "cmp");
usort($templates, "cmp2");

($_SERVER['QUERY_STRING'] == 'endpoints') ? die(json_encode(array('Successful' => true, 'example' => $example, 'available-templates' => $availableendpoints))) : null;

$doRandom = false;
$sources = array();
$template = null;

function getTemplate($temp = null)
{
	global $templates;

	if($temp != null)
	{
		foreach($templates as $t)
		{
			if(strtolower($t->name) == strtolower($temp))
			{
				return $t;
			}
		}
	}
	else
	{
		return $templates[rand(0, sizeof($templates))];
	}

	return null;
}

function doCheckURL()
{
	global $doRandom;
	global $templates;
	global $template;
	global $availableendpoints;
	global $example;

	if($_SERVER['QUERY_STRING'] == 'random')
	{
		$template = getTemplate();
		$doRandom = true;

		return;
	}

	if(isset($_GET['template']))
	{
		$template = getTemplate($_GET['template']);

		($template == null) ? doError('Malformed Request: template "'.$_GET['template'].'" does not exist') : null;

		(isset($_GET['source1']) ? $doRandom = false : $doRandom = true);

		return;
	}

    displayPrettyFront();
}

function displayPrettyFront()
{
    global $templates;
    header('Content-Type: text/html');
    ?>
<html>
<head>
<style type="text/css">
body {
    margin:0;
    padding:0;
}
table {
    margin:0 auto;
}
tr{
    color:white;
    text-align:center;
}
tr:first-child{
    background-color:#111;
}
tr:nth-child(odd){
    background-color:#555;
}
tr:nth-child(even){
    background-color:#333;
}
tr a{
    color:white;
}
</style>
</head>
<body>
<table>
<tr>
<td>Name</td><td>Sources Required</td><td>Usage</td><td>Template</td>
</tr>
<?php
    foreach($templates as $endpoint)
    {
        $currUrl = 'https://'.$_SERVER['SERVER_NAME'].'/fun/meme/'.$endpoint->name.'/?source1=https://vignette.wikia.nocookie.net/internet-meme/images/6/6e/Pogchamp.jpg';
        IF($endpoint->sources > 1)
        {
            for($x = 0; $x < $endpoint->sources; $x++)
            {
                $currUrl = $currUrl.'&source'.($x+1).'=https://vignette.wikia.nocookie.net/internet-meme/images/6/6e/Pogchamp.jpg';
            }
        }
        ?>
            <tr>
                <td><?=$endpoint->name?></td>
                <td><?=$endpoint->sources?></td>
                <td><a href="<?=$currUrl?>"><?=$currUrl?></a></td>
                <td><img src="https://<?=$_SERVER['SERVER_NAME']?>/fun/meme/templates/images/<?=$endpoint->image?>" width="320" />
            </tr>
        <?php
    }
?>
</body>
</html>
    <?php
}

function doError($reason)
{
	global $availableendpoints;
	global $example;

	http_response_code(400);
	die(json_encode(array('Successful' => false, 'reason' => $reason, 'example' => $example, 'available-templates' => $availableendpoints)));
}

doCheckURL();

if($doRandom)
{
	$dir = scandir(getcwd().'/source/');
	unset($dir[0]);
	unset($dir[1]);
	shuffle($dir);

	for($z=0;$z<$template->sources;$z++)
	{
		array_push($sources, getcwd().'/source/'.$dir[$z]);
	}
}
else
{
	foreach($_GET as $gek => $gev)
	{
		(strpos($gek, "source") === 0) ? array_push($sources, $gev) : null;
	}
}

if($template->sources > 1 && $template->sources > sizeof($sources) && !$doRandom)
{
	doError("Not enough sources given");
}

require getcwd().'/vendor/autoload.php';

$guzzcli = new GuzzleHttp\Client();
$manager = new Intervention\Image\ImageManager(array('driver' => 'imagick'));

$t = $manager->make(getcwd().'/templates/images/'.$template->image);
$b = $manager->canvas($t->getWidth(), $t->getHeight(), '#000');
$b->encode('png');

function doImage($source, $position)
{
	global $manager;
	global $b;
	global $template;
	global $t;
	global $guzzcli;

	$i = $source;

	if(strpos($source, "http") === 0)
	{
		$res = $guzzcli->request('GET', $source);
	
		if($res->getStatusCode() != '200')
		{
			doError('Couldn\'t get Source Image ID '.($position+1));
			die();
		}

		$i = $res->getBody();
	}

	$s = $manager->make($i);
	$s->encode('png');

	$s->resize($template->position[$position]->w, $template->position[$position]->h, function($c)
	{
		$c->aspectratio();
	});

	if($template->rotate != 0)
	{
		$s->rotate(($template->rotate < 0 ? -$template->position[$position]->r : $template->position[$position]->r));
	}

	$factorx = round(($template->position[$position]->w - $s->getWidth()) / 2);
	$factory = round(($template->position[$position]->h - $s->getHeight()) / 2);

	if($template->under !== 0)
	{
		$b->insert($s, 'top-left', $template->position[$position]->x + $factorx, $template->position[$position]->y + $factory);
		$b->insert($t);
	}
	else
	{
		$b->insert($t);
		$b->insert($s, 'top-left', $template->position[$position]->x + $factorx, $template->position[$position]->y + $factory);
	}
	$s->destroy();
}

for($x = 0; $x < $template->sources; $x++)
{
	if($template->sources == 1 && sizeof($template->position) > 1)
	{
		for($y = 0; $y < sizeof($template->position); $y++)
		{
			doImage($sources[$x], $y);
		}
	}
	else
	{
		doImage($sources[$x], $x);
	}
}

$t->destroy();

header('Content-Type: '.$b->mime());

echo $b->response();
$b->destroy();
?>
