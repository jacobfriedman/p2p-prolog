:- use_module(library(debug)).
:- use_module(library(udp_broadcast)).
:- use_module(library(paxos)).

:- debug(paxos(node)).
:- debug(paxos(replicate)).

:- use_module(library(http/websocket)).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).

         /*******************************
         *        INITIALIZATION    *
         *******************************/


:- http_open_websocket('ws://localhost:8083/ws', WS, []), nb_setval(websocket, WS).


main :-
    set_prolog_flag(toplevel_goal, prolog), % become interactive
    current_prolog_flag(argv, Argv),
    argv_options(Argv, _Rest, []),
    paxos_initialize([]).

:- initialization(main, main).


         /*******************************
         *   HANDY INTERACTIVE TESTS    *
         *******************************/

:- op(900, xfx, [:=, g]).
:- op(900,  fx, [g]).

K := V :-
    paxos_set(K, V).

g(K,V) :-
    paxos_get(K, V).
g(K) :-
    paxos_get(K, V),
    format('~q = ~p~n', [K, V]).


         /*******************************
         *           UDP CONFIG     *
         *******************************/

:- multifile
    paxos:paxos_message_hook/3.


/*
broadcast_request(+Term)
Unlike broadcast/1, this predicate stops if an associated goal succeeds. Backtracking causes it to try other listeners. A broadcast request is used to fetch information without knowing the identity of the agent providing it. C.f. “Is there someone who knows the age of John?'' could be asked using
        ...,
        broadcast_request(age_of('John', Age)),
If there is an agent (listener) that registered an‘age-of' service and knows about the age of‘John' this question will be answered.
*/

/*
broadcast(+Term)
Broadcast Term. There are no limitations to Term, though being a global service, it is good practice to use a descriptive and unique principal functor. All associated goals are started and regardless of their success or failure, broadcast/1 always succeeds. Exceptions are passed.

*/
/*broadcast_request(Message) :- writeln(Message). */
/*
broadcast_request(Message) :- b_getval(websocket, WS), ws_receive(WS, Message). 
*/


/*broadcast(Message) :- writeln(Message). */

/*:- listen(libp2p(paxos, Paxos), (writeln(Paxos), true) ). 
:- listen(libp2p(paxos, Paxos, TMO), (writeln([Paxos, TMO]), true) ). 
*/
/*
:- listen(libp2p(paxos, Paxos), (writeln(Paxos), true) ). 
*/


:- nb_getval(websocket, WS), listen(
        libp2p(paxos, Paxos), 
        (
               ws_send(WS, text([Paxos])),
                true
        )
     ). 


:- nb_getval(websocket, WS), listen(
        libp2p(paxos, Paxos, TMO), 
        (
                ws_send(WS, text([Paxos, TMO])),
                true
        )
     ). 



paxos:paxos_message_hook(Paxos, -,   libp2p(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, libp2p(paxos, Paxos, TMO)).


/*
echo(WebSocket) :-
    ws_receive(WebSocket, Message),
    (   Message.opcode == close
    ->  true
    ;   string_concat('Hey, you said ', Message.data , MessageRes),
        ws_send(WebSocket, text(MessageRes)),
        echo(WebSocket)
    ).
    */

/*:- http_server(http_dispatch, [port(8083)]). */

/*
p2p(paxos, Paxos, TMO) :- writeln(paxos), writeln(Paxos), writeln(TMO).
*/

/*
paxos:paxos_message_hook(Paxos, -,   udp(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, udp(paxos, Paxos, TMO)).
*/






/*
paxos_message_hook/3 translates internal message, sent to broadcast/1. 
UDP or TIPC libraries use listen/2,3 to listen to these messages and send them along. 

paxos:paxos_message_hook(Paxos, -,   p2p(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, p2p(paxos, Paxos, TMO)).

And than have a listen/2,3 call that listens to p2p(...) messages
and sends them to libp2p.

My worry is that both the UDP and TIPC libraries allocate a thread that
reads inbound messages and relays them to the paxos library. You do not
have threads in WASM, which means you need to have something that listens
to several event channels and takes action as input is available on one
of these.  Something like wait_for_input/3.  I have little clue how that
should work for libp2p (and I guess normal browser events).
*/