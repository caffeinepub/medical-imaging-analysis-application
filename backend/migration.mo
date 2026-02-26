module {
  type OldActor = {
    // Old state fields (unused as migration does not transfer state)
  };

  type NewActor = {
    // New state fields
  };

  public func run(old : OldActor) : NewActor {
    // Return empty new state
    {};
  };
};
