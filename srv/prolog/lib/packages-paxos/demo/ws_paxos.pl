:- use_module(library(debug)).
:- use_module(library(udp_broadcast)).
:- use_module(library(paxos)).

:- use_module(library(backcomp)).

:- debug(paxos(node)).
:- debug(paxos(replicate)).

:- use_module(library(http/websocket)).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).

         /*******************************
         *        INITIALIZATION    *
         *******************************/


:- http_open_websocket('ws://localhost:8083/ws', WS, []), 
   nb_setval(websocket, WS).

/*

We don't need a server to handle incoming...
the WS opens a socket and we just parse the receipts.

:- http_handler(root(ws),
    http_upgrade_to_websocket(echo, []),
    [spawn([])]).

    echo(WS) :- nb_setval(websocket, WS),
        ws_receive(WS, Message),
        (   Message.opcode == close
        ->  true
        ;   string_concat('Hey, you said ', Message.data , MessageRes),
            ws_send(WS, text(MessageRes)), 
            echo(WS)
        ).
*/



main :-
    set_prolog_flag(toplevel_goal, prolog), % become interactive
    current_prolog_flag(argv, Argv),
    argv_options(Argv, _Rest, Options),
    paxos_initialize(Options).

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

:- nb_getval(websocket, WS), listen(
        libp2p(paxos, Paxos), 
        (
               (
                ws_send(WS, prolog(Paxos)),
                wait_for_input([WS], WS, 1), 
                ws_receive(WS, Message, [format(prolog)]),
                assertz(Message.data)
                ),
               true
        )
     ). 


:- nb_getval(websocket, WS), listen(
        libp2p(paxos, Paxos, TMO), 
        (
                (
                ws_send(WS, prolog(Paxos)),
                wait_for_input([WS], WS, TMO), 
                ws_receive(WS, Message, [format(prolog)]),
                assertz(Message.data)
                ),
                true
        )
     ). 


paxos:paxos_message_hook(Paxos, -,   libp2p(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, libp2p(paxos, Paxos, TMO)).



/*:- http_server(http_dispatch, [port(8083)]). */





