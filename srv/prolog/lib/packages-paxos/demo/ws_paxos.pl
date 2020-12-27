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
ld_dispatch(S, Message, From) :-
    !, tipc_get_name(S, Name),
    term_to_atom(wru(Name), Atom),
    tipc_send(S, Atom, From, []).

ld_dispatch(S, Message, From) :-
    !, forall(broadcast_request(Term),
          (   term_to_atom(Term, Atom),
              tipc_send(S, Atom, From, []))).

ld_dispatch(_S, Term, _From) :-
    safely(broadcast(Term)).
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
                    wait_for_input([WS], WS, 0), 
                    ws_receive(WS, Message, [format(prolog)]),
                    writeln(Message.data)
                ),
               true
        )
     ). 


:- nb_getval(websocket, WS), listen(
        libp2p(paxos, Paxos, TMO), 
        (
                (                    
                    forall(broadcast_request(Term),
                      (   
                        writeln(Term),
                        term_to_atom(Term, Atom),
                        send(WS, Atom, [format(prolog)]),
                        writeln(Message)
                      )
                    ),
                    ws_send(WS, prolog(Paxos)),
                    wait_for_input([WS], WS, TMO), 
                    ws_receive(WS, Message, [format(prolog)]),
                    writeln(Message.data)
                ),
                true
        )
     ). 
/*

udp_br_collect_replies(Queue, Timeout, Reply) :-
      get_time(Start),
      Deadline is Start+Timeout,
      repeat,
         (   thread_get_message(Queue, Reply,
                                [ deadline(Deadline)
                                ])
         ->  true
         ;   !,
             fail
         ).

*/

dispatch(WS) :-
    ws_receive(WS, Message, [format(prolog)]),
    writeln(Message),
    dispatch(WS).
   
   /* route(WS, Term),
    !,
    dispatch_traffic(S).*/





:- multifile
    paxos:paxos_message_hook/3.






paxos:paxos_message_hook(Paxos, -,   libp2p(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, libp2p(paxos, Paxos, TMO)).

/* :- nb_getval(websocket, WS), dispatch(WS). */

/*:- http_server(http_dispatch, [port(8083)]). */





