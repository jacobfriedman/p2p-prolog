# Currently open issues

## Testing

### Simulate poor network						[OK]

  - Create an unreliable udp_receive/4?
    - Have a thread reading the socket
    - Drop some packages
    - Duplicate some packages
    - Reorder some packages.

### Manage nodes							[OK]

  - Have a process that adds and removes nodes.
  - Ask one or more nodes to perform an action using a TCP link
    - Can we ask multiple nodes to do different things?
      - [node(N)-Action, ...]
    - Actions
      - Set key to value
      - Perform set/get sequence on key
  - Query for the expected consensus over TCP links
    - Consistent value for key
    - Occured change messages

## Implementation issues

  - If a `changed` or `learned` event is not received the data is not
    acknowledged.  We can periodically check the ledger for such statements
    and run a full _get_ (and _set_?) to resolve the issue.
    - Can we be more lightweight, notably for learned keys.

  - Should we actively make the quorum smaller on a failing node?
    - If we don't and there are not enough quorum members left we
      can not set any values.  This is notably the case if the
      quorum is dangerously small (e.g., 2).
    - If we lower the quorum, a previous majority for some key may
      not longer be a majority, getting a wrong value.

### Data optimization

  - Store generation and holders in separate arrays based on keys
    that are mapped to integers.
