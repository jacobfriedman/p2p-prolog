# SWI-Prolog package paxos

This package provides the library `paxos.pl` that implements a
replicating key-value store of Prolog terms on top of SWI-Prolog
`broadcast` libraries and its TIPC or UDP based extension that
allow broadcasting outside the process using networking.

## Features and usage

This library allows a cluster of Prolog processes that can communicate
using TIPC or UDP to maintain a replicated key-value store. Both keys
and values are arbitrary ground Prolog terms. Nodes may be dynamically
added and removed from the cluster while the cluster maintains a shared
view of the available nodes and their status. The library uses the
_paxos_ algorithm to guarantee consistency and progress in the context
of appearing and failing nodes as well as networking that may drop
packages, have packages arrive out-of-order or be duplicated.

Changes to key values are available as reliable _broadcast_ events in
the participating nodes.

## Application areas

This package has been primarily developed to support clustered HTTP
servers that need to share status information such as _session cookies_.

## Dependencies

This package requires either the TIPC or `clib` package to provide
network enabled broadcasting.

## Status

The current implementation is incomplete and has barely been tested.

## Plans

  - Complete and test the implementation
  - Make the storage _hookable_ and provide scalable backends based
    on e.g. RocksDB.
  - The current version only support the _quorum_.  There is only
    partial support for _learners_ that follow the _quorum_, but
    do not participate in voting.


## History

This library was originally conceived by Jeffrey Rosenwald as
`tipc_paxos.pl` as part of the [TIPC
package](https://github.com/SWI-Prolog/contrib-tipc). Jeffrey later
implemented `udp_broadcast.pl` as an alternative network enabled
broadcast transport that could be used for `tipc_paxos.pl`. Jan
Wielemaker renamed the library to `paxos.pl` and added hooks to work
with both the TIPC and UDP (and potentially other) transport mechanisms.

As the project grows more complicated and both requires support
libraries and a testing framework it has been moved to be an extension
package of SWI-Prolog.
