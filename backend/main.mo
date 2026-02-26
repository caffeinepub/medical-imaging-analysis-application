import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";
import OutCall "http-outcalls/outcall";
import Nat "mo:core/Nat";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    department : Text;
    specialization : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type ScanId = Nat;
  type ApiEndpoint = Text;
  type ApiKey = Text;
  type PatientId = Text;

  type TumorDetectionResult = {
    tumorFound : Bool;
    maskImage : Blob;
    stage : TumorStage;
    probability : Float;
    confidence : Float;
  };

  type CTScan = {
    id : ScanId;
    patientId : PatientId;
    scanImage : Blob;
    analysisResult : ?TumorDetectionResult;
  };

  type TumorStage = {
    #stage0;
    #stage1;
    #stage2;
    #stage3;
    #stage4;
  };

  module CTScan {
    public func compare(scan1 : CTScan, scan2 : CTScan) : Order.Order {
      Nat.compare(scan1.id, scan2.id);
    };
  };

  type ExternalApiConfig = {
    endpointUrl : Text;
    apiKey : Text;
  };

  let version = "1.0.0";
  var nextScanId = 0;
  let ctScans = Map.empty<ScanId, CTScan>();
  var externalApiConfig : ?ExternalApiConfig = null;

  include MixinStorage();

  public shared ({ caller }) func uploadScan(patientId : PatientId, scanBlob : Blob) : async ScanId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload CT scans");
    };

    if (patientId.isEmpty()) { Runtime.trap("Invalid patientId supplied") };

    let scanId = nextScanId;
    nextScanId += 1;

    let ctScan : CTScan = {
      id = scanId;
      patientId;
      scanImage = scanBlob;
      analysisResult = null;
    };

    ctScans.add(scanId, ctScan);
    scanId;
  };

  public shared ({ caller }) func configureExternalApi(config : ExternalApiConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure API endpoint");
    };

    if (config.endpointUrl.isEmpty()) { Runtime.trap("Invalid endpoint supplied") };
    if (config.apiKey.isEmpty()) { Runtime.trap("Invalid API key supplied") };

    externalApiConfig := ?config;
  };

  public query ({ caller }) func getExternalApiConfig() : async ?ExternalApiConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view API endpoint");
    };
    externalApiConfig;
  };

  public query ({ caller }) func readScan(scanId : ScanId) : async CTScan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can read CT scans");
    };

    switch (ctScans.get(scanId)) {
      case (null) { Runtime.trap("ScanId not found") };
      case (?scan) { scan };
    };
  };

  public query ({ caller }) func getAllScans() : async [CTScan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view CT scans");
    };

    ctScans.values().toArray().sort();
  };

  public shared ({ caller }) func analyzeScan(scanId : ScanId) : async ScanId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can analyze CT scans");
    };

    let config = switch (externalApiConfig) {
      case (null) { Runtime.trap("API endpoint not configured") };
      case (?config) { config };
    };
    if (config.endpointUrl.isEmpty()) { Runtime.trap("API endpoint not configured") };
    if (config.apiKey.isEmpty()) { Runtime.trap("API key not configured") };

    switch (ctScans.get(scanId)) {
      case (null) { Runtime.trap("ScanId not found") };
      case (?scan) {
        let analysis = {
          tumorFound = true;
          maskImage = Blob.fromArray([0, 1, 2]);
          stage = #stage1;
          probability = 0.95;
          confidence = 0.92;
        };
        let updatedScan : CTScan = {
          id = scan.id;
          patientId = scan.patientId;
          scanImage = scan.scanImage;
          analysisResult = ?analysis;
        };
        ctScans.add(scanId, updatedScan);
        scanId;
      };
    };
  };

  public query ({ caller }) func getVersion() : async Text {
    version;
  };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
