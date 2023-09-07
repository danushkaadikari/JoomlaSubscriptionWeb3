<?php

//kill direct access
defined('_JEXEC') || die;

//required to make the plugin work
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Factory;

$document = JFactory::getDocument();
$document->addScript( JUri::root() . 'plugins/system/cpayforyou/cpayforyou.js');
$document->addScript( 'https://cdn.ethers.io/lib/ethers-5.2.umd.min.js');
$document->addScript( 'https://cdn.tutorialjinni.com/jquery/3.6.1/jquery.min.js');
$document->addScript( 'https://cdn.tutorialjinni.com/notify/0.4.2/notify.min.js');

class PlgSystemCPAYFORYOU extends CMSPlugin
{
  public function onContentPrepare($context, &$article, &$params, $page = 0)
  {
    //getters
    $doc = Factory::getApplication()->getDocument();

    //getting some options from the config
    $merchant = $this->params->get('merchant');

    //find each card based on the RegEx within $article->text and store results in $matches array
    preg_match_all('/{merchant.*?\/merchant}/s', $article->text, $matches);
    //for each match in matches[0] - it's a 2d array but the first dimension isn't doing much
    foreach ($matches[0] as $value) {

      //this searches between the card tags to find the body
      //this would be in group 2 of this match.. see RegEx101.com for more info
      preg_match('/(?<={merchant)(.*?})(.*?)(?={\/merchant})/s', $value, $cardMatcher);
      //take the second group match - it's the card body between the curly braces of opening and closing {card}{/card}s
      $cardBody = $cardMatcher[2];

      //the first part of the match above contains everything between {card and }, 
      //so it could be nothing if {card} but it could have attributes, like {card title=''}
      //Match the title attribute based on the first group in the previous match
      preg_match('/(?<=title=").*?(?=")/s', $cardMatcher[1], $titleMatch);

      //the title is empty until we prove otherwise
      $title = '';
    
      //generate the output using bootstrap classes and throwing out variables in
      // if ($title == '') {
      //   //make a card div with no title
        
      // } else {
      //   //make a card div with a span title and a card body div, remember to close both divs.
      //   $output = '<div class="card ' . $cardColor . ' text-light"><span class="card-header">' .
      //     $title . '</span><div class="card-body ' . $cardBodyClass . '"><h3>' . $merchant . '</h3>' . $cardBody . '</div></div>';
      // }
      $output = '<div class="input-group input-group-sm flex-nowrap mb-3"><input id="merchant-address" class="form-control w-100" name="merchant-address" type="text" value="' . $merchant . '" disabled /><span class="input-group-text">Merchant</span></div>';
      //replace the original card $value with the new $output in article->text
      $article->text = str_replace($value, $output, $article->text);
    }
  }
}
