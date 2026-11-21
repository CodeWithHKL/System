<?php
if (function_exists('xdebug_start_code_coverage') && strpos($_SERVER['SCRIPT_FILENAME'] ?? '', '/DONATION/') !== false) {
  xdebug_start_code_coverage(XDEBUG_CC_UNUSED | XDEBUG_CC_DEAD_CODE);
  register_shutdown_function(function () {
    $c = xdebug_get_code_coverage();
    xdebug_stop_code_coverage();
    $out = [];
    foreach ($c as $f => $l) { if (strpos($f, '/DONATION/') !== false) $out[basename($f)] = $l; }
    file_put_contents('/cov/' . microtime(true) . '-' . getmypid() . '.json', json_encode($out));
  });
}
