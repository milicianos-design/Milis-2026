// Editores del foro y de las notas, empaquetados con el sitio (antes venían de CDNs).
// main.js los usa como globales (`typeof Quill`, `typeof EditorJS`, ...), por eso se exponen en window.
// Este módulo tiene que cargarse antes que main.js.
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import EditorjsList from '@editorjs/list';
import Quote from '@editorjs/quote';
import Embed from '@editorjs/embed';
import edjsHTML from 'editorjs-html';
import { marked } from 'marked';

Object.assign(window, { Quill, EditorJS, Header, EditorjsList, Quote, Embed, edjsHTML, marked });
