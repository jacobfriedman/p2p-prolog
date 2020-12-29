:- use_module(library(debug)).
:- use_module(library(udp_broadcast)).
:- use_module(library(paxos)).

:- debug(paxos(node)).
:- debug(paxos(replicate)).

         /*******************************
         *        INITIALIZATION    *
         *******************************/

init_network :-
    udp_broadcast_initialize("239.0.0.2",
                             [ 
                                scope(paxos),
                                method(multicast)
                             ]).

main :-
    current_prolog_flag(argv, Argv),
    argv_options(Argv, _Rest, Options),
    init_network,
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

paxos:paxos_message_hook(Paxos, -,   udp(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, udp(paxos, Paxos, TMO)).

exit :- thread_get_message(exit).