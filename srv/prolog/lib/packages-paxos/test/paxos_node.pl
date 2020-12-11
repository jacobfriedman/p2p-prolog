/*  Part of SWI-Prolog

    Author:        Jan Wielemaker
    E-mail:        J.Wielemaker@vu.nl
    WWW:           http://www.swi-prolog.org
    Copyright (c)  2018, VU University Amsterdam
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

    1. Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.

    2. Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in
       the documentation and/or other materials provided with the
       distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
    FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
    COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
    INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
    BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
    LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
    ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
*/

:- module(paxos_node,
          [ start_node/1,                       % +Options
            (:=)/2,                             % +Key, +Value
            (<-)/2,                             % -Value, +Key
            ledger/2,                           % ?Key, ?Value
            ledger/4                            % ?Key, ?Gen, ?Value, ?Holders
          ]).
:- use_module(library(apply)).
:- use_module(library(broadcast)).
:- use_module(library(debug)).
:- use_module(library(udp_broadcast)).
:- use_module(library(paxos)).
:- use_module(library(settings)).

:- use_module(nodes).
:- reexport(poor_udp).

network("239.0.0.2",
        [ method(multicast)
        ]).

%!  start_node(+Options)
%
%   Setup a paxos node using UDP networking.  Options:
%
%     - debug(+Topic)
%     - nodebug(+Topic)
%     - spy(+Pred)
%
%   Options are forwarded to paxos_initialize/1.

start_node(Options) :-
    setup_debug(Options),
    network(IP, NetworkOptions),
    udp_broadcast_initialize(IP,
                             [ scope(paxos)
                             | NetworkOptions
                             ]),
    set_setting(paxos:max_sets, 5),
    set_setting(paxos:response_timeout, 0.010),
    paxos_initialize(Options),
    paxos_on_change(Key, Value,
                    key_changed(Key, Value)).

key_changed(Key, Value) :-
    debug(nodes(broadcast), 'Key change: ~p', [Key-Value]),
    broadcast(nodes(changed(Key, Value))).


setup_debug(Options) :-
    maplist(setup_debug_, Options),
    set_prolog_flag(message_context, [node, thread, time]).

setup_debug_(debug(Topic)) :-
    !,
    debug(Topic).
setup_debug_(nodebug(Topic)) :-
    !,
    nodebug(Topic).
setup_debug_(spy(Spec)) :-
    !,
    tspy(Spec).
setup_debug_(_).

:- multifile
    prolog:message_prefix_hook/2.

prolog:message_prefix_hook(node, Prefix) :-
    node_self(Node),
    format(string(Prefix), '[node ~w]', [Node]).


		 /*******************************
		 *      PAXOS INTERACTION	*
		 *******************************/

:- op(800, xfx, <-).

K := V :-
    paxos_set(K, V).

V <- K :-
    paxos_get(K, V).

%!  ledger(?Key, ?Value) is semidet.
%!  ledger(?Key, ?Gen, ?Value, ?Holders) is semidet.
%
%   Query the memory of the node, bypassing paxos_get/2.

ledger(Key, Value) :-
    paxos:paxons_ledger(Key, _Gen, Value, _Holders).
ledger(Key, Gen, Value, Holders) :-
    paxos:paxons_ledger(Key, Gen, Value, Holders).


		 /*******************************
		 *           UDP CONFIG		*
		 *******************************/

:- multifile
    paxos:paxos_message_hook/3.

paxos:paxos_message_hook(Paxos, -,   udp(paxos, Paxos)) :- !.
paxos:paxos_message_hook(Paxos, TMO, udp(paxos, Paxos, TMO)).

