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

:- module(poor_udp,
          [ udp_drop/1,                         % +Rate
            udp_late/2,                         % +Rate, +Decay
            udp_duplicate/2,                    % +Rate, +Decay
            udp_delay/2,                        % +Rate, +Decay
            udp_profile/1                       % +ListOrName
          ]).
:- use_module(library(random)).
:- use_module(library(debug)).
:- use_module(library(apply)).
:- use_module(library(socket), []).
:- use_module(library(udp_broadcast), []).

% :- debug(udp(qos)).

/** <module> Emulate a unreliable UDP network

This library hooks into library(udp_broadcast) to emulate poor reception
of UDP messages. It  can  emulate   package  loss,  late  (out-of-order)
arrival, duplicated packages and  delayed   (slow)  arrival. The initial
network quality is perfect.

@tbd Possibly we should also implement package   loss  for sending a UDP
message, so we can easily  emulate  a   poor  node  in an otherwise well
functioning network.
*/

:- dynamic
    drop_rate/1,
    late_rate/2,
    dupl_rate/2,
    delay_rate/2,
    delayed/5.

drop_rate(0).
late_rate(0, 0).
dupl_rate(0, 0).
delay_rate(0, 0).

%!  udp_drop(+Rate)
%
%   Rate is the probability that  a  package   is  dropped.  `0` means a
%   perfect network, `1` a completely broken network.

udp_drop(Rate) :-
    retractall(drop_rate(_)),
    asserta(drop_rate(Rate)).

%!  udp_late(+Rate, +Decay)
%
%   Rate is the probability that the package will arrive late, i.e., out
%   of order. Decay is the probability it will arrive after the next.

udp_late(Rate, Decay) :-
    retractall(late_rate(_, _)),
    asserta(late_rate(Rate, Decay)).

%!  udp_duplicate(+Rate, +Decay)
%
%   Rate is the probability the package  is duplicated. This accepts the
%   package immediately as is and stores  a   copy  in the queue that is
%   also used by late/2.

udp_duplicate(Rate, Decay) :-
    retractall(dupl_rate(_, _)),
    asserta(dupl_rate(Rate, Decay)).

%!  udp_delay(+Rate, +Decay)
%
%   Rate is the probability to delay the message. This introduces random
%   sleeps of 10ms. After each sleep there  is a probability of Decay to
%   wake up. Thus, with a Decay  of   0.5  we wait 10ms with probability
%   0.5, 20ms with probability 0.25, 30ms with probability 0.125, etc.

udp_delay(Rate, Decay) :-
    retractall(delay_rate(_, _)),
    asserta(delay_rate(Rate, Decay)).

%!  udp_profile(+Spec) is det.
%
%   Set all network connection quality parameters. Spec is either a list
%   of calls to drop/1, late/2, duplicate/2  and/or delay/2 or a profile
%   name. See profile/2 for details.

udp_profile(Actions) :-
    is_list(Actions),
    !,
    maplist(apply, Actions).
udp_profile(Name) :-
    profile(Name, Actions),
    maplist(apply, Actions).

apply(drop(Rate))             :- udp_drop(Rate).
apply(late(Rate, Decay))      :- udp_late(Rate, Decay).
apply(duplicate(Rate, Decay)) :- udp_duplicate(Rate, Decay).
apply(delay(Rate, Decay))     :- udp_delay(Rate, Decay).

%!  profile(+Name, -Settings)
%
%   Define network quality profiles.

:- multifile
    profile/2.

profile(perfect,
        [ drop(0),
          late(0,0),
          duplicate(0,0),
          delay(0,0)
        ]).
profile(poor,
        [ drop(0.02),
          late(0.02, 0.5),
          duplicate(0.02, 0.5),
          delay(0.02, 0.5)
        ]).
profile(disconnected,
        [ drop(1)
        ]).


:- abolish(udp_broadcast:udp_receive/4).

udp_broadcast:udp_receive(Socket, Data, From, Options) :-
    udp_receive(Socket, Data, From, Options),
    (   dupl_rate(Rate, Decay),
        maybe(Rate)
    ->  assertz(delayed(Socket, Data, From, Decay, duplicate))
    ;   true
    ),
    delay.

udp_receive(Socket, Data, From, _Options) :-
    clause(delayed(Socket, Data1, From1, Rate, Why), true, Ref),
    maybe(Rate),
    !,
    Data = Data1,
    From = From1,
    erase(Ref),
    udp_debug('Re-inserting package (~w) ~p', [Why], Data, From).
udp_receive(Socket, Data, From, Options) :-
    socket:udp_receive(Socket, Data0, From0, Options),
    (   drop_rate(Drop),
        maybe(Drop)
    ->  udp_debug('Dropped package ~p', [], Data0, From0),
        udp_receive(Socket, Data, From, Options)
    ;   late_rate(Rate, Decay),
        maybe(Rate)
    ->  assertz(delayed(Socket, Data0, From0, Decay, reorder)),
        udp_debug('Taking package out of order ~p', [], Data0, From0),
        udp_receive(Socket, Data, From, Options)
    ;   Data = Data0,
        From = From0
    ).

udp_debug(Message, Args, Data, _From) :-
    udp_broadcast:udp_term_string(_Scope, Term, Data),
    append(Args, [Term], AllArgs),
    debug(udp(qos), Message, AllArgs).

delay :-
    delay_rate(Rate, Decay),
    maybe(Rate),
    !,
    get_time(Now),
    repeat,
        sleep(0.010),
        maybe(Decay),
    !,
    get_time(End),
    Delay is round((End-Now)*1000),
    debug(udp(qos), 'Delayed with ~Dms', [Delay]).
delay.
