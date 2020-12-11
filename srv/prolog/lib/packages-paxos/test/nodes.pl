/*  Part of SWI-Prolog

    Author:        Jan Wielemaker
    E-mail:        J.Wielemaker@vu.nl
    WWW:           http://www.swi-prolog.org
    Copyright (c)  2018, VU University Amsterdam
			 CWI, Amsterdam
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

:- module(test_nodes,
          [ node_create/1,              % ?Id
            node_create/2,              % ?Id, +Options
            current_node/1,             % ?Id

            call_on/1,                  % +Goals
            call_on/2,                  % +Node, ?Goal
            call_on/3,                  % +Node, ?Goal, :Handler
            run_on/2,                   % +Node, +Goal

            run_node/0,                 % Run a client node
            node_self/1                 % -Id
          ]).
:- use_module(library(apply)).
:- use_module(library(broadcast)).
:- use_module(library(lists)).
:- use_module(library(debug)).
:- use_module(library(error)).
:- use_module(library(option)).
:- use_module(library(unix)).
:- use_module(library(process)).
:- use_module(library(socket)).

:- meta_predicate
    call_on(+,+,0),

    safely(0).

% :- debug(nodes(connect)).

/** <module> Test interacting processes

This module provides a test  framework   that  manages multiple _nodes_,
either on the same or on different  machines   on  which  we can start a
program, e.g., using `ssh`.

The nodes are connected to the controller using sockets.
*/

%!  node(?Id, ?StreamPair)
%
%   Identifies a node in our network.

:- dynamic
    self_channel/1,                     % Pipe
    node/2,                             % NodeID, Stream
    node_pid/2,                         % NodeID, PID
    client/2,                           % NodeID, Stream
    queue/3,                            % Id, Node, Queue
    gate/1,                             % Host:Port
    pending/4,                          % Passwd, Id, Queue, Options
    proxy_message_kind/1.

%!  node_create(?Node, +Options)
%
%   Create a new node at address and connect it.   Options
%
%     - alias(Name:atom)
%       Name of the node.  May also be passed as Id.
%     - proxy_messages(+Kinds)
%       Kinds is either a list of message kinds (see print_message/2)
%       or one of the constants `none` or `all`.  Default is not to
%       proxy any messages.
%     - launcher(+Launcher)
%       Defines how the node is created.  Currently supports
%       - background
%         Run as background job,  This is the default.
%       - terminator
%         Run using a _terminator_ terminal emulator.
%     - async(Bool)
%       If `true` (default `false`), do not wait for the node to become
%       online.
%
%   @arg Node is either a single node id  or a list of ids or variables.
%   In the latter case multiple nodes are started concurrently.

node_create(Id) :-
    node_create(Id, []).

node_create(Ids, Options) :-
    is_list(Ids),
    !,
    maplist(default_id, Ids),
    controller,
    node_gate(_Port),
    start_queue(Q, Options),
    maplist(launch(Q, Options), Ids),
    wait_started(Q, Ids).
node_create(Id, Options) :-
    option(alias(Id), Options, Id),
    default_id(Id),
    controller,
    node_gate(_Port),
    start_queue(Q, Options),
    launch(Q, Options, Id),
    wait_started(Q, [Id]).

launch(Queue, Options, Id) :-
    option(launcher(Launcher), Options, background),
    launcher(Launcher, Id, Prog, Args),
    password_option(Passwd, PasswdOption),
    connect_option(ConnectOption),
    append(Args,
           [ '-g', 'run_node', file('nodes.pl'),
             ConnectOption,
             PasswdOption
           ], ProgArgs),
    asserta(pending(Passwd, Id, Queue, Options)),
    process_create(Prog, ProgArgs,
                   [ process(Pid)
                   ]),
    asserta(node_pid(Id, Pid)).

start_queue(Queue, Options) :-
    option(async(true), Options, false),
    !,
    Queue = [].
start_queue(Queue, _) :-
    message_queue_create(Queue).

wait_started([], _) :-
    !.
wait_started(_, []) :-
    !.
wait_started(Queue, Ids) :-
    thread_get_message(Queue, Msg),
    (   Msg = started(Id)
    ->  selectchk(Id, Ids, Rest),
        wait_started(Queue, Rest)
    ;   throw(Msg)
    ).

launcher(background, _,  path(swipl), []).
launcher(terminator, Id, path(terminator), ['--title', Title, '-x', 'swipl']) :-
    format(string(Title), 'Node ~w', [Id]).

default_id(Id) :-
    var(Id),
    repeat,
      gensym(n, Id),
      \+ node(Id, _),
      \+ node_pid(Id, _),
    !.
default_id(Id) :-
    (   node(Id, _)
    ;   node_pid(Id, _)
    ),
    !,
    permission_error(alias, node, Id).
default_id(_).

:- on_signal(chld, _, child_changed).

child_changed(_Sig) :-
    (   node_pid(Node, PID),
        catch(process_wait(PID, Status,
                           [ timeout(0)
                           ]),
              E,
              (   print_message(warning, E),
                  fail
              )),
        Status \== timeout,
        retractall(node_pid(Node, PID)),
        debug(nodes(pid), 'Process ~p for node ~p: stopped with ~p',
              [PID, Node, Status]),
        fail
    ;   true
    ).

%!  current_node(?Id) is nondet.
%
%   True when Id is the identifier of a known node.

current_node(Node) :-
    node(Node, _).


		 /*******************************
		 *          CONTROLLER		*
		 *******************************/

%!  run_on(+Node, +Goal) is det.
%
%   Run Goal on node without waiting   for  completion. Use call_on/2 to
%   run Goal synchronously.

run_on(Nodes, Goal) :-
    is_list(Nodes),
    !,
    forall(member(Node, Nodes),
           run_on_(Node, Goal)).
run_on(Node, Goal) :-
    run_on_(Node, Goal).

run_on_(Node, Goal) :-
    node_stream(Node, Stream),
    fast_write(Stream, call(Goal)),
    flush_output(Stream).

node_stream(Node, Stream) :-
    node(Node, Stream),
    !.
node_stream(Node, _) :-
    existence_error(node, Node).


%!  call_on(+Nodes:list, +Goal) is nondet.
%!  call_on(+Node, +Goal) is semidet.
%
%   Run once(Goal) on  Node.  The  binding,   failure  or  exception  is
%   propagated to the caller. If  the  first   argument  is  a list, the
%   message is sent to each member of the  list and the replies from the
%   nodes is enumerated on backtracking.

call_on(Nodes, Goal) :-
    is_list(Nodes),
    !,
    length(Nodes, NodeCount),
    term_variables(Goal, Vars),
    Template =.. [v|Vars],
    call_id(Id),
    message_queue_create(Q),
    State = nodes(NodeCount),
    setup_call_cleanup(
        asserta(queue(Id, Nodes, q(Q)), Ref),
        ( forall(( member(Node, Nodes),
                   node_stream(Node, Stream)
                 ),
                 ( fast_write(Stream, call(Id, Goal, Template)),
                   flush_output(Stream)
                 )),
          collect_replies(State, Q, Goal, Template)
        ),
        erase(Ref)).
call_on(Node, Goal) :-
    term_variables(Goal, Vars),
    Template =.. [v|Vars],
    node_stream(Node, Stream),
    call_id(Id),
    message_queue_create(Q),
    setup_call_cleanup(
        asserta(queue(Id, Node, q(Q)), Ref),
        ( fast_write(Stream, call(Id, Goal, Template)),
          flush_output(Stream),
          thread_get_message(Q, from(_Node, Reply))
        ),
        erase(Ref)),
    query_reply(Reply, Node, Goal, Template).

%!  call_on(+Node, +Goal, :Handler)
%
%   Asynchronous calling. Runs Goal  on  Node   and  when  the  reply is
%   received it runs Handler with  the   obtained  bindings.  Handler is
%   executed in the inbound thread and should thus typically start a new
%   thread or relay the message to a message queue.

call_on(Node, Goal, Handler) :-
    term_variables(Goal, Vars),
    Template =.. [v|Vars],
    node_stream(Node, Stream),
    call_id(Id),
    asserta(queue(Id, Node, call(Template,Handler)), Ref),
    catch(( fast_write(Stream, call(Id, Goal, Template)),
            flush_output(Stream)
          ), E,
          ( erase(Ref),
            throw(E)
          )).


%!  call_on(+Tasks)
%
%   Submit different tasks and wait for them   to complete. Tasks are of
%   the form `Node:Goal`. If a task fails   or  throws an exception, all
%   variables are unified with '$NULL'.

call_on(Goals) :-
    call_id(Id),
    message_queue_create(Q),
    setup_call_cleanup(
        asserta(queue(Id, [], q(Q)), Ref),
        ( submit_goals(Goals, Id, 1, Templates),
          collect_replies(Templates, Q)
        ),
        erase(Ref)).

submit_goals([], _, _, []).
submit_goals([Node:Goal|Goals], Id, I, Templates) :-
    term_variables(Goal, Vars),
    Template =.. [v,I|Vars],
    I2 is I + 1,
    (   catch(( node(Node, Stream),
                fast_write(Stream, call(Id, Goal, Template)),
                flush_output(Stream)
              ), E,
              ( print_message(warning, E),
                fail
              ))
    ->  Templates = [node(Node, Template)|More],
        submit_goals(Goals, Id, I2, More)
    ;   submit_goals(Goals, Id, I2, Templates)
    ).

collect_replies([], _) :-
    !.
collect_replies(Templates, Queue) :-
    thread_get_message(Queue, from(Node, Reply)),
    template_reply(Reply, Node, Templates, Templates1),
    collect_replies(Templates1, Queue).

template_reply(true(Template), Node, Templates, Rest) :-
    select(node(Node, Template), Templates, Rest),
    !.
template_reply(error(_E), Node, Templates, Rest) :-
    nullify(Node, Templates, Rest).
template_reply(false, Node, Templates, Rest) :-
    nullify(Node, Templates, Rest).
template_reply(end_of_file, Node, Templates, Rest) :-
    nullify(Node, Templates, Rest).

nullify(Node, Templates, Rest) :-
    select(node(Node, Template), Templates, Rest),
    !,
    term_variables(Template, Vars),
    maplist(=('$NULL'), Vars).


%!  call_id(-Id)
%
%   Id is the next id to use for a call.  We simply use integers.

:- dynamic
    current_query_id/1.

call_id(Id) :-
    with_mutex(test_nodes, call_id_sync(Id0)),
    Id = Id0.

call_id_sync(Id) :-
    retract(current_query_id(Id0)),
    Id is Id0+1,
    asserta(current_query_id(Id)).
call_id_sync(1) :-
    asserta(current_query_id(1)).

%!  query_reply(+Reply, +Node, +Goal, +Template)

query_reply(true(Template), _, _, Template).
query_reply(error(E), _, _, _) :-
    throw(E).
query_reply(false, _, _, _) :-
    fail.
query_reply(end_of_file, _, halt, _) :-
    !.
query_reply(end_of_file, Node, _, _) :-
    throw(error(node_error(Node, halted), _)).

collect_replies(State, Queue, Goal, Template) :-
    repeat,
      thread_get_message(Queue, from(Node, Reply)),
      arg(1, State, Left),
      Left1 is Left - 1,
      nb_setarg(1, State, Left1),
      (   Left1 == 0
      ->  !
      ;   true
      ),
      query_reply(Reply, Node, Goal, Template).


		 /*******************************
		 *              GATE		*
		 *******************************/

%!  node_gate(?Port, -Password) is det.
%
%   Create the gate keeper that accepts new nodes.

node_gate(Port) :-
    gate(localhost:Port),
    !.
node_gate(Port) :-
    tcp_socket(Socket),
    tcp_bind(Socket, Port),
    tcp_listen(Socket, 5),
    thread_create(gate_keeper(Socket), _,
                  [ alias(node_gate)
                  ]),
    asserta(gate(localhost:Port)).      % TBD: find our hostname

gate_keeper(S) :-
    repeat,
    tcp_accept(S, S2, Peer),
    debug(nodes(connect), 'Accept from ~p', [Peer]),
    tcp_open_socket(S2, Pair),
    catch(accept_node(Pair, Peer), E,
          print_message(warning, E)),
    fail.

accept_node(Pair, Peer) :-
    fast_read(Pair, node(Passwd)),
    debug(nodes(connect), 'Got passwd = ~p', [Passwd]),
    passwd_pass(Passwd, Peer, Id, Queue, Options),
    asserta(node(Id, Pair)),
    self_channel(Self),
    debug(nodes(connect), 'Informing self', []),
    fast_write(Self, join(Id)),
    flush_output(Self),
    debug(nodes(connect), 'Confirming ~p to client', [Id]),
    fast_write(Pair, id(Id, Options)),
    flush_output(Pair),
    (   Queue == []
    ->  true
    ;   thread_send_message(Queue, started(Id))
    ).

passwd_pass(Passwd, _, Id, Queue, Options) :-
    retract(pending(Passwd, Id, Queue, Options)),
    !.
passwd_pass(_, Peer, _, Queue, _) :-
    (   Queue == []
    ->  true
    ;   thread_send_message(Queue,
                            error(permission_error(connect, node, Peer),_))
    ),
    permission_error(connect, node, Peer).

password_option(Passwd, PasswdOption) :-
    PasswdNum is random(1<<63),
    number_string(PasswdNum, Passwd),
    format(atom(PasswdOption), '--password=~w', [Passwd]).

connect_option(Connect) :-
    gate(Gate),
    format(atom(Connect), '--connect=~w', [Gate]).


		 /*******************************
		 *            CONNECT		*
		 *******************************/

%!  run_node
%
%   Run a node.

run_node :-
    current_prolog_flag(argv, Argv),
    argv_options(Argv, _Rest, Options),
    debug(nodes(client), 'Running ~p', [node(Options)]),
    run_node(Options).

run_node(Options) :-
    option(password(Password), Options),
    option(connect(Address), Options),
    atomic_list_concat([Host,PortAtom], :, Address),
    atom_number(PortAtom, Port),
    tcp_connect(Host:Port, Stream, []),
    fast_write(Stream, node(Password)),
    flush_output(Stream),
    fast_read(Stream, id(Id, NodeOptions)),
    run_node(Id, Stream, NodeOptions).

%!  run_node(+Id, +Stream, +Options)
%
%   Control a node.
%
%   @arg Options is passed down  from   node_create/3  that created this
%   node.  See node_create/3 for the processed options.

run_node(Id, Stream, Options) :-
    option(proxy_messages(Proxy), Options, []),
    asserta(client(Id, Stream)),
    init_message_proxy(Proxy),
    listen(Id, nodes(Message),
           proxy_message(Stream, Message)),
    node_loop(Stream).

proxy_message(Stream, Message) :-
    debug(nodes(broadcast), 'Forwarding broadcast message ~p', [Message]),
    fast_write(Stream, broadcast(Message)),
    flush_output(Stream).

node_loop(Stream) :-
    fast_read(Stream, Command),
    debug(nodes(command), 'Client got ~p', [Command]),
    (   Command == end_of_file
    ->  true
    ;   safely(execute(Command, Stream)),
        node_loop(Stream)
    ).

execute(call(Id, Call, Template), Stream) :-
    (   catch(user:Call, E, true)
    ->  (   var(E)
        ->  Reply = true(Template)
        ;   Reply = error(E)
        )
    ;   Reply = false
    ),
    fast_write(Stream, reply(Id, Reply)),
    flush_output(Stream).
execute(call(Call), _Stream) :-
    call(Call).

init_message_proxy(none) :-
    !.
init_message_proxy([]) :-
    !.
init_message_proxy(List) :-
    is_list(List),
    !,
    forall(member(Kind, List),
           assertz(proxy_message_kind(Kind))),
    link_messages.
init_message_proxy(all) :-
    assertz(proxy_message_kind(_)),
    link_messages.

link_messages :-
    asserta(user:message_hook(Term, Kind, Lines) :-
               message_proxy_hook(Term, Kind, Lines)).

message_proxy_hook(Term, Kind, Lines) :-
    Kind \== silent,
    client(_Node, Stream),
    proxy_message_kind(Kind),
    !,
    fast_write(Stream, message(Term, Kind, Lines)),
    flush_output(Stream).

%!  prolog:debug_print_hook(+Topic, +Format, +Args) is semidet.
%
%   Forward debug messages to the node controller.

prolog:debug_print_hook(Topic, Format, Args) :-
    proxy_message_kind(debug(Topic)),
    client(_Node, Stream),
    fast_write(Stream, debug(Topic, Format, Args)),
    flush_output(Stream).

%!  node_self(-Node) is semidet.
%
%   True when Node is the node id of this client node. Fails in the node
%   manager.

node_self(Node) :-
    client(Node, _Stream).

		 /*******************************
		 *            DISPATCH		*
		 *******************************/

:- dynamic
    controller/1.

controller :-
    controller(_Id),
    !.
controller :-
    with_mutex(test_nodes, controller_sync).

controller_sync :-
    controller(_),
    !.
controller_sync :-
    thread_create(dispatch, Id,
                  [ alias(node_message_handler)
                  ]),
    asserta(controller(Id)).

dispatch :-
    init_node_controller,
    self_channel(Self),
    findall(S, node(_, S), Streams),
    dispatch([Self|Streams]).

dispatch(Streams) :-
    wait_for_input(Streams, Available, infinite),
    maplist(dispatch_available(Streams, Streams1), Available),
    dispatch(Streams1).

dispatch_available(Set0, Set, Stream) :-
    node(Node, Stream),
    !,
    fast_read(Stream, Term),
    (   dispatch_term(Term, Node, Set0, Set)
    ->  true
    ;   print_message(warning, dispatch_failed(Node, Term)),
        Set = Set0
    ).
dispatch_available(Set0, Set, Stream) :-
    self_channel(Stream),
    fast_read(Stream, Term),
    dispatch_admin(Term, Set0, Set).

dispatch_term(end_of_file, Node, Set0, Set) :-
    !,
    debug(nodes(connect), 'EOF for ~p', [Node]),
    node(Node, Stream),
    delete(Set0, Stream, Set),
    lost(Node).
dispatch_term(reply(Magic,Term), Node, Set, Set) :-
    queue(Magic, _, Action),
    dispatch_reply(Action, Magic, Node, Term).
dispatch_term(message(Term, Kind, Lines), Node, Set, Set) :-
    proxy_message(Node, Term, Kind, Lines).
dispatch_term(debug(Topic, Format, Args), Node, Set, Set) :-
    proxy_debug(Node, Topic, Format, Args).
dispatch_term(broadcast(Term), Node, Set, Set) :-
    broadcast(node(Node, Term)).

dispatch_reply(q(Queue), _Magic, Node, Term) :-
    thread_send_message(Queue, from(Node, Term)).
dispatch_reply(call(Term,Handler), Magic, _Node, Term) :-
    retractall(queue(Magic, _, _)),
    safely(Handler).


%!  proxy_message(+Node, +Term, +Kind, +Lines)
%
%   Handle a message sent to us from  a node. Forwarding messages allows
%   us to examine the flow of events in the nodes as one stream.

proxy_message(Node, _Term, Kind, Lines) :-
    current_prolog_flag(message_context, Ctx0),
    setup_call_cleanup(
        ( nb_setval(message_node, Node),
          set_prolog_flag(message_context, [node,time])
        ),
        print_message_lines(user_error, kind(Kind), Lines),
        ( set_prolog_flag(message_context, Ctx0),
          nb_delete(message_node)
        )).

:- multifile
    prolog:message_prefix_hook/2.

prolog:message_prefix_hook(node, Prefix) :-
    nb_current(message_node, Node),
    format(string(Prefix), '[node ~w]', [Node]).

dispatch_admin(join(Id), Set, [Stream|Set]) :-
    node(Id, Stream).

proxy_debug(Node, Topic, Format, Args) :-
    phrase('$messages':translate_message(debug(Format, Args)), Lines),
    current_prolog_flag(message_context, Ctx0),
    setup_call_cleanup(
        ( nb_setval(message_node, Node),
          set_prolog_flag(message_context, [node,time])
        ),
        print_message_lines(user_error, kind(debug(Topic)), Lines),
        ( set_prolog_flag(message_context, Ctx0),
          nb_delete(message_node)
        )).



%!  lost(+Node)
%
%   Close the communication to Node.

lost(Node) :-
    retract(node(Node, Stream)),
    close(Stream, [force(true)]),
    forall(retract(queue(_, Node, Action)),
           lost(Action, Node)).

lost(q(Queue), Node) :-
    !,
    thread_send_message(Queue, from(Node, end_of_file)).
lost(_Action, _Node).


		 /*******************************
		 *        INITIALIZATION	*
		 *******************************/

init_node_controller :-
    self_channel(_),
    !.
init_node_controller :-
    pipe(R, W),
    set_stream(R, encoding(octet)),
    set_stream(W, encoding(octet)),
    stream_pair(Pipe, R, W),
    asserta(self_channel(Pipe)).


		 /*******************************
		 *            UTIL		*
		 *******************************/

safely(Goal) :-
    E = error(_,_),
    (   catch(Goal, E,
              print_message(warning, E))
    ->  true
    ;   print_message(warning, goal_failed(Goal))
    ).
