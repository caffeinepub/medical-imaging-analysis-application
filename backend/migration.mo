import Map "mo:core/Map";

module {
  type UserProfile = {
    name : Text;
    department : Text;
    specialization : Text;
  };

  type CTScan = {
    id : Nat;
    patientId : Text;
    scanImage : Blob;
    analysisResult : ?TumorDetectionResult;
  };

  type TumorDetectionResult = {
    tumorFound : Bool;
    maskImage : Blob;
    stage : TumorStage;
    probability : Float;
    confidence : Float;
  };

  type TumorStage = {
    #stage0;
    #stage1;
    #stage2;
    #stage3;
    #stage4;
  };

  type ExternalApiConfig = {
    endpointUrl : Text;
    apiKey : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    nextScanId : Nat;
    apiEndpoint : Text;
    apiKey : Text;
    ctScans : Map.Map<Nat, CTScan>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    nextScanId : Nat;
    ctScans : Map.Map<Nat, CTScan>;
    externalApiConfig : ?ExternalApiConfig;
  };

  public func run(old : OldActor) : NewActor {
    let apiConfig = if (old.apiEndpoint != "" and old.apiKey != "") {
      ?{
        endpointUrl = old.apiEndpoint;
        apiKey = old.apiKey;
      };
    } else {
      null;
    };
    {
      userProfiles = old.userProfiles;
      nextScanId = old.nextScanId;
      ctScans = old.ctScans;
      externalApiConfig = apiConfig;
    };
  };
};
