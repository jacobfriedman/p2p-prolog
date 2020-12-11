# Paxos demo

  - Make sure to have SWI-Prolog 7.7.16 or later

Use two or more consoles that run on  machines in the same LAN. They may
run on the same machine. In each, start

    swipl multicast.pl udp_paxos.pl

Play around using the predicates :=/2 and g/1   to set and fetch keys in
the different consoles.

    ?- a := 1.
    ?- g a.

You can see all data known to a node using

    ?- listing(paxons_ledger).
