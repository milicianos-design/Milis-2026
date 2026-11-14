<?php
declare(strict_types=1);

namespace Milis\Content;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Limpia el HTML que mandan los usuarios antes de guardarlo (además, el frontend lo vuelve a
 * limpiar con DOMPurify al mostrarlo). Solo deja formato básico, links y videos de YouTube.
 */
final class HtmlSanitizer
{
    public const YOUTUBE_EMBED = '%^https://www\.(youtube|youtube-nocookie)\.com/embed/[A-Za-z0-9_-]{11}%';

    private ?HTMLPurifier $rich = null;
    private ?HTMLPurifier $inline = null;

    /** HTML de los posts del foro (editor Quill). */
    public function rich(string $html): string
    {
        $this->rich ??= new HTMLPurifier($this->config(
            'p[class],br,strong,b,em,i,u,s,a[href|target|rel],ol,ul,li[class],blockquote,pre[class],code,h1,h2,h3,span[class],'
            . 'iframe[src|class|frameborder|allowfullscreen]',
            withIframes: true
        ));
        return trim($this->rich->purify($html));
    }

    /** Texto con formato dentro de un bloque de Editor.js (negrita, cursiva, links). */
    public function inline(string $html): string
    {
        $this->inline ??= new HTMLPurifier($this->config('b,strong,i,em,u,s,code,br,a[href|target|rel]', withIframes: false));
        return trim($this->inline->purify($html));
    }

    private function config(string $allowed, bool $withIframes): HTMLPurifier_Config
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('Cache.DefinitionImpl', null); // no escribe archivos de caché en el servidor
        $config->set('Core.Encoding', 'UTF-8');
        $config->set('HTML.Doctype', 'HTML 4.01 Transitional');
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true]);
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        $config->set('Attr.AllowedClasses', array_merge(
            ['ql-align-center', 'ql-align-right', 'ql-align-justify', 'ql-video', 'ql-syntax'],
            array_map(fn (int $n) => "ql-indent-$n", range(1, 8))
        ));
        $config->set('HTML.Allowed', $allowed);
        if ($withIframes) {
            $config->set('HTML.SafeIframe', true);
            $config->set('URI.SafeIframeRegexp', self::YOUTUBE_EMBED);
            $config->set('HTML.DefinitionID', 'milis-rich');
            $config->set('HTML.DefinitionRev', 1);
            if ($def = $config->maybeGetRawHTMLDefinition()) {
                $def->addAttribute('iframe', 'allowfullscreen', 'Bool');
            }
        }
        return $config;
    }
}
