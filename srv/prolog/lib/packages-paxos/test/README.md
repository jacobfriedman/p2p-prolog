# Paxos testing platform

This directory contains the test libraries for   the paxos code. To test
paxos we need to run  scenarios  and   verify  that  the nodes behave as
expected.  Two libraries provide a starting point for this:

  - poor_udp.pl allows for simulating a poor UDP connection by
    redefining the usage of udp_receive/4 in udp_broadcast.pl. It
    allows for configuring lost, duplicated and reordered messages.
  - nodes.pl allows for controlling a set of processes that act
    as nodes, sending commands to these nodes and receive feedback.

## Node events

  - Add a node
  - Stop a node
  - Set a key on a node
  - Make a node modify a key, such as increment its value
    - [Q] if multiple nodes perform increment, does this
      result in a reliable final value?
      - [NO] A reads N, writes N+1, B does exactly the same:
        single increment.
    - [Q] can we simulate a lock?
