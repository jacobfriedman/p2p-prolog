:- use_module(library(http/websocket)).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).

:- http_handler(root(ws),
    http_upgrade_to_websocket(echo, []),
    [spawn([])]).

echo(WebSocket) :-
    ws_receive(WebSocket, Message),
    (   Message.opcode == close
    ->  true
    ;   string_concat('Hey, you said ', Message.data , MessageRes),
        ws_send(WebSocket, text(MessageRes)),
        echo(WebSocket)
    ).

:- http_server(http_dispatch, [port(8083)]).

