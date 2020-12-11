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

:- module(scenario,
          [ play/1,                             % +Scenario
            play/2,                             % +Scenario, +Options

            op(800, xfx, <-),
            op(990, xfy, &&)
          ]).
:- use_module(library(lists)).
:- use_module(library(broadcast)).
:- use_module(library(option)).
:- use_module(library(apply)).
:- use_module(library(error)).
:- use_module(library(debug)).
:- use_module(nodes).

/** <module> Describe and run concurrent test scnearios

Describe and run a concurrent scenario.  Scheduling:

  - Run several actions at a _step_
  - Run asynchronous commands

Basic actions:

  - Node manipulation
    - start_node(?Id)
      Create a new node
    - start_nodes(?List)
      Start multiple nodes concurrently and wait for the quorum
      to get synchronised on the new value.
    - udp(+Id, Profile)
      Causes the UDP network for Id to get quality Profile
  - Running commands on a node
    - on(+Node, +Command)
      Run Command on Node and wait for its completion.  Propagate
      results.
    - on(+Node, +Command, :Handler)
      Run Command on node asynchronously.  When answer is received,
      run Handler.  Variable bindings are propagated.
    - run(+Node, +Command)
      Run Command on Node asynchronously.  Success means the command
      is _delivered_.
  - Verifying results
    - A == B
    - A =:= B
      Implicit conditions
    - wait_for(Target)
      Wait for asynchronous reception of a term subsumed by Target.
      If target is a list, wait for multiple terms.  By default
      the timeout is 20 seconds.
    - expect(Term)
      Expect asynchronous reception of Term.  This action returns
      immediately.  If Term is not received this is reported at the
      end of the scenario.
*/

scenario(basic,
         [ start_nodes([a,b]),
           on(b, k := 1),
           on(a, K <- k),
           K == 1
         ]).
scenario(ledger,
         [ start_nodes([a,b]),
           on(b, k := 1),
           on(a, ledger(k,K)),
           K == 1
         ]).
scenario(change,
         [ start_nodes([a,b]),
           run(a, k := 1),
           wait_for(node(b, changed(k,X))),
           X == 1
         ]).
scenario(change2,
         [ start_nodes([a,b]),
           run(a, k := 1),
           wait_for([ node(a, changed(k,A)),
                      node(b, changed(k,B))
                    ]),
           [A,B] == [1,1]
         ]).
scenario(holder,
         [ start_nodes([a,b,c]),
           on(a, k := 1),
           on(a, ledger(k,_,KB,HB)), KB == 1, popcount(HB) =:= 3
         ]).
scenario(interrupt,
         [ start_nodes([a,b,c]),
           on(a, k := 1),
           udp(b, disconnected),
           on(a, k := 2),
           on(a, ledger(k,_,KA,HA)), KA == 2, popcount(HA) =:= 2,
           on(c, ledger(k,_,KC,HC)), KC == 2, popcount(HC) =:= 2,
           on(b, ledger(k,_,KB,HB)), KB == 1, popcount(HB) =:= 3,
           udp(b, perfect),
           % FIXME: b should recover
           on(b, K2 <- k), K2 == 2
         ]).

:- meta_predicate
    safely(0).

%!  play(+Steps) is semidet.
%!  play(+Steps, +Options) is semidet.
%
%   Play all Steps.  Options:
%
%     - speed(ActionsPerSec)
%       Time between actions

play(Steps) :-
    play(Steps, []).

play(Steps, Options) :-
    is_list(Steps),
    !,
    message_queue_create(Q),
    setup_call_cleanup(
        listen(Q, node(Node, Term), thread_send_message(Q, node(Node,Term))),
        play(Steps, _{queue:Q}, State, 0, Tick, Options),
        unlisten(Q)),
    played(State, Tick).
play(Scenario, Options) :-
    scenario(Scenario, Steps),
    play(Steps, Options).

%!  play(+Steps, +State0, -State, +Tick0, -Ticks, +Options)
%
%   State fields:
%
%     - nodes:Nodes
%       List of known nodes
%     - failed:Steps
%       List of failed steps
%     - queue:Queue
%       Queue for collecting async replies from our nodes.
%     - expecting:Terms
%       Broadcast terms expected
%     - unexpected:Terms
%       Broadcast terms that arrived but were not expected

play([], State0, State, Tick, Tick, Options) :-
    close_nodes(State0, State, Options).
play([H|T], State0, State, Tick0, Tick, Options) :-
    run_step(H, State0, State1, Tick0, Options),
    Tick1 is Tick0+1,
    safely(delay(State1, State2, Options)),
    play(T, State2, State, Tick1, Tick, Options).

run_step(Action, State0, State, Tick, Options) :-
    debug(scenario(step), '[Step ~p] ~p ...', [Tick, Action]),
    must_be(nonvar, Action),
    catch(step(Action, State0, State, Tick, Options),
          E,
          ( print_message(warning, E),
            fail
          )),
    !.
run_step(Action, State0, State, Tick, _Options) :-
    print_message(warning, scenario(failed(Action, Tick))),
    update_state(failed(Action), State0, State, Tick).

step(A&&B, State0, State, Tick, Options) :-
    !,
    run_conj(A&&B, State0, State, Tick, 1, Options).
% Node management
step(start_node(Id), State0, State, Tick, Options) :-
    node_create(Id, Options),
    call_on(Id, (load_files(paxos_node),start_node(Options))),
    update_state(add_node(Id), State0, State, Tick).
step(start_nodes(Ids), State0, State, Tick, Options) :-
    node_create(Ids, Options),
    findall(Node,
            call_on(Ids, ( load_files(paxos_node),
                           start_node([node(Node)|Options]))),
            Nodes),
    wait_for_quorum(Ids, Nodes, State0, State1, Options),
    update_state(add_nodes(Ids), State1, State, Tick).
step(udp(Id, Profile), State, State, _Tick, _Options) :-
    call_on(Id, udp_profile(Profile)).
% Run actions on nodes
step(on(Node, Action), State, State, _Tick, _Options) :-
    call_on(Node, Action).
step(run(Node, Action), State, State, _Tick, _Options) :-
    run_on(Node, Action).
% Verify results.
step(X==Y, State, State, _Tick, _Options) :-
    X==Y.
step(X=:=Y, State, State, _Tick, _Options) :-
    E = error(_,_),
    catch(X=:=Y, E, fail).
step(expect(Term), State0, State, Tick, _Options) :-
    update_state(expect(Term), State0, State, Tick).
step(wait_for(Term), State0, State, _Tick, Options) :-
    wait_for(Term, State0, State, Options).
step(wait(Time), State0, State, _Tick, Options) :-
    delay(State0, State, [timeout(Time)|Options]).

%!  run_conj(+Conjunction, +State0, -State, +Tick, +SubTick, +Options)

run_conj(A&&B, State0, State, Tick, SubTick, Options) :- !,
    run_step(A, State0, State1, Tick-SubTick, Options),
    SubTick1 is SubTick + 1,
    run_conj(B, State1, State, Tick, SubTick1, Options).
run_conj(Last, State0, State, Tick, SubTick, Options) :-
    run_step(Last, State0, State, Tick-SubTick, Options).

update_state(add_node(Id), State0, State, _Tick) :-
    add_state_list(nodes, Id, State0, State).
update_state(failed(Test), State0, State, Tick) :-
    add_state_list(failures, failed(Test, Tick), State0, State).
update_state(expect(Term), State0, State, _Tick) :-
    add_state_list(expecting, Term, State0, State).
update_state(add_nodes(Ids), State0, State, _Tick) :-
    prepend_state_list(nodes, Ids, State0, State).

add_state_list(Field, Value, State0, State) :-
    (   get_dict(Field, State0, List)
    ->  put_dict(Field, State0, [Value|List], State)
    ;   put_dict(Field, State0, [Value], State)
    ).

prepend_state_list(Field, Values, State0, State) :-
    (   get_dict(Field, State0, List)
    ->  append(Values, List, NewList),
        put_dict(Field, State0, NewList, State)
    ;   put_dict(Field, State0, Values, State)
    ).

%!  delay(+State0, -State, +Options)
%
%   Delay execution until the  next  step.   While  waiting  we  collect
%   messages that we receive from the nodes.

:- meta_predicate
    handle_messages_until(+, -, +, 1).

delay(State0, State, Options) :-
    option(timeout(Delay), Options),
    !,
    (   Delay =:= 0
    ->  handle_messages(State0, State)
    ;   get_time(Now),
        Deadline is Now + Delay,
        debug(scenario(async), 'Scenario: waiting ~p ...', [Delay]),
        handle_messages_until(State0, State, Deadline, false)
    ).
delay(State0, State, Options) :-
    option(speed(Speed), Options),
    !,
    get_time(Now),
    Timeout is 1/Speed,
    Deadline is Now + Timeout,
    debug(scenario(async), 'Scenario: waiting ~p ...', [Timeout]),
    handle_messages_until(State0, State, Deadline, false).
delay(State0, State, _Options) :-
    handle_messages(State0, State).

false(_) :-
    fail.

handle_messages(State0, State) :-
    thread_get_message(State0.queue, Msg, [timeout(0)]),
    debug(scenario(async), 'Scenario: async ~p', [Msg]),
    !,
    safely(handle_message(Msg, State0, State1)),
    handle_messages(State1, State).
handle_messages(State, State).


% ! handle_messages_until(+State0, -State, +Deadline, +Condition) is det.
%
%   Handle  messages  until   Deadline   or    a   message   for   which
%   call(Condition, Message) succeeds.

handle_messages_until(State0, State, Deadline, Condition) :-
    thread_get_message(State0.queue, Msg, [deadline(Deadline)]),
    debug(scenario(async), 'Scenario: async ~p', [Msg]),
    !,
    (   call(Condition, Msg)
    ->  State = State0
    ;   safely(handle_message(Msg, State0, State1)),
        handle_messages_until(State1, State, Deadline, Condition)
    ).
handle_messages_until(State, State, _, _).

handle_message(Term, State0, State1) :-
    select(Expecting, State0.get(expecting), Rest),
    Expecting =@= Term,
    !,
    State1 = State0.put(expecting, Rest).
handle_message(Term, State, State) :-
    ignore_inbound(Term),
    !.
handle_message(Term, State0, State) :-
    add_state_list(unexpected, Term, State0, State).

ignore_inbound(node(_Node, changed(_Key,_Value))).

%! wait_for_quorum(+Nodes:list, +PaxosNodes:list,
%!                 +State0, -State, +Options) is semidet.
%
%   Wait for Nodes to become member of   the quorum. Currently waits for
%   at most 20 seconds.

wait_for_quorum(Nodes, Paxos, State0, State, _Options) :-
    debug(scenario(nodes), 'Created nodes ~p; waiting paxos ~p to be in quorum',
          [Nodes, Paxos]),
    list_to_bitmap(Paxos, Bitmap),
    get_time(Now),
    Deadline is Now + 20,
    wait_for_quorum_on_nodes(Nodes, Bitmap, State0, State, Deadline, Quora),
    is_list(Quora),
    sort(Quora, QuoraS),
    debug(scenario(nodes), 'Quora updated to ~p', [QuoraS]).

wait_for_quorum_on_nodes([], _, State, State, _, []).
wait_for_quorum_on_nodes(Nodes, Bitmap, State0, State, Deadline,
                         [Node-Quorum|Quora]) :-
    handle_messages_until(State0, State1, Deadline,
                          quorum_includes(Bitmap, Node, Quorum)),
    delete(Nodes, Node, Rest),
    wait_for_quorum_on_nodes(Rest, Bitmap, State1, State, Deadline, Quora).

quorum_includes(Bitmap, Node, Quorum,
                node(Node,changed('$paxos_quorum',Quorum))) :-
    Bitmap /\ Quorum =:= Bitmap.

list_to_bitmap([], 0).
list_to_bitmap([H|T], Bitmap) :-
    list_to_bitmap(T, Bitmap0),
    Bitmap is Bitmap0 \/ (1<<H).

%!  wait_for(+Target, +State0, -State, +Options) is semidet.
%
%   Wait until a term is broadcasted to us that is subsumed by Target.

wait_for(Terms, State0, State, Options) :-
    is_list(Terms),
    !,
    option(timeout(Timeout), Options, 20),
    get_time(Now),
    Deadline is Now + Timeout,
    wait_multiple(Terms, State0, State, Deadline).
wait_for(Term, State0, State, Options) :-
    option(timeout(Timeout), Options, 20),
    get_time(Now),
    Deadline is Now + Timeout,
    handle_messages_until(State0, State, Deadline,
                          is_message(Term, True)),
    True == true.

is_message(Target, true, Term) :-
    subsumes_term(Target, Term),
    Term = Target.

wait_multiple([], State, State, _).
wait_multiple(Terms, State0, State, Deadline) :-
    handle_messages_until(State0, State1, Deadline,
                          select_message(Terms, Rest)),
    (   Rest == Terms
    ->  fail
    ;   wait_multiple(Rest, State1, State, Deadline)
    ).

select_message(Targets, Rest, Term) :-
    select(Target, Targets, Rest),
    subsumes_term(Target, Term),
    !,
    Term = Target.

%!  close_nodes(+State0, -State, +Options)
%
%   Close the still running nodes by making them execute halt/0.

close_nodes(State0, State, _Options) :-
    del_dict(nodes, State0, Nodes, State),
    !,
    maplist(close_node, Nodes).
close_nodes(State, State, _).

close_node(Node) :-
    call_on(Node, halt).

%!  played(+State, +Tick) is det.
%
%   We finished playing the scenario with final state State at Tick

played(State, _) :-
    check_empty(State, failures, Error),
    check_empty(State, expecting, Error),
    check_empty(State, unexpected, Error),
    var(Error).

check_empty(State, Field, true) :-
    List = State.get(Field),
    List \== [],
    !,
    print_message(error, scenario(non_empty(Field, List))).
check_empty(_, _, _).


		 /*******************************
		 *             UTIL		*
		 *******************************/
safely(Goal) :-
    E = error(_,_),
    (   catch(Goal, E,
              print_message(warning, E))
    ->  true
    ;   print_message(warning, goal_failed(Goal))
    ).

		 /*******************************
		 *            MESSAGES		*
		 *******************************/

:- multifile prolog:message//1.

prolog:message(scenario(Msg)) -->
    message(Msg).

message(failed(Test, Tick)) -->
    [ '[Step ~p] FAILED: ~p'-[Tick, Test] ].
message(non_empty(failures, List)) -->
    [ 'The following steps failed:'-[], nl ],
    { reverse(List, Steps) },
    steps(Steps).

steps([]) --> [].
steps([H|T]) -->
    step(H),
    (   { T == [] }
    ->  []
    ;   [nl],
        steps(T)
    ).

step(failed(Test, Tick)) -->
    [ '[Step ~p] ~p'-[Tick, Test] ].
