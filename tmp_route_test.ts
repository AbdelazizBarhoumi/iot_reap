import type { UrlMethodPair } from './node_modules/@inertiajs/core/types/types';
import type { RouteDefinition } from './resources/js/wayfinder';

type _Test = RouteDefinition<'get'> extends UrlMethodPair ? true : false;
const _x: UrlMethodPair = { url: 'a', method: 'get' };
const y: RouteDefinition<'get'> = { url: 'a', method: 'get' };
const _z: UrlMethodPair = y;
