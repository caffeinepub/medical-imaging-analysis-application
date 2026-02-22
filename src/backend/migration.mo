import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Blob "mo:core/Blob";

module {
  type TumorDetectionResult = {
    tumorFound : Bool;
    maskImage : Blob;
    stage : {
      #stage0;
      #stage1;
      #stage2;
      #stage3;
      #stage4;
    };
    probability : Float;
    confidence : Float;
  };

  type OldCTScan = {
    id : Nat;
    patientId : Text;
    scanImage : Blob;
    analysisResult : ?TumorDetectionResult;
  };

  type OldActor = {
    nextScanId : Nat;
    apiEndpoint : Text;
    ctScans : Map.Map<Nat, OldCTScan>;
  };

  // New actor with apiKey field.
  type NewActor = {
    nextScanId : Nat;
    apiEndpoint : Text;
    apiKey : Text;
    ctScans : Map.Map<Nat, OldCTScan>;
  };

  // Migration function called by main actor.
  public func run(old : OldActor) : NewActor {
    { old with apiKey = "" };
  };
};
