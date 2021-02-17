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
    /*trace,*/
    set_prolog_flag(toplevel_goal, prolog), % become interactive
 /*  current_prolog_flag(argv, Argv),
    argv_options(Argv, _Rest),*/
    paxos_initialize([node(123)]).

:- initialization(main, main), trace(paxos_message).


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
                    forall(broadcast_request(Term),
                      (   
                        writeln(Term),
                        ws_send(WS, prolog(Term))
                      )
                    )
                ),
               true
        )
     ). 


:- nb_getval(websocket, WS), listen(
        libp2p(paxos, Paxos, TMO), 
        (
                ( 

                    ws_send(WS, prolog(Paxos)),                    
                    forall(broadcast_request(Term),
                      (   
                        ws_send(WS, prolog(Term)),
                        wait_for_input([WS], WS, TMO)
                      )
                    )
                    
                    
                ),
                true
        )
     ). 

/*

// We can't do this because we won't have THREADS!
dispatch(WS) :-
    ws_receive(WS, Message, [format(json)]),
    ( Message.opcode == close
    -> true
    ; 
      dispatch(WS)
    ).

:-  nb_getval(websocket, WS), dispatch(WS) .
*/

/*
:-
    repeat,
    ws_receive(WS, Message, [format(prolog)]),
    writeln(Message).
    */
   
   /* route(WS, Term),
    !,
    dispatch_traffic(S).*/





:- multifile
    paxos:paxos_message_hook/3.




/* 10 Second Timeout */
paxos:paxos_message_hook(Paxos, 10,   libp2p(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, libp2p(paxos, Paxos, TMO)).



/* :- nb_getval(websocket, WS), dispatch(WS). */

/*:- http_server(http_dispatch, [port(8083)]). */





