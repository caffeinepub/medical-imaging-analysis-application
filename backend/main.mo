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
import OutCall "http-outcalls/outcall";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
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

  let version = "1.0.0";
  var nextScanId = 0;
  var apiEndpoint : ApiEndpoint = "";
  var apiKey : ApiKey = "";
  let ctScans = Map.empty<ScanId, CTScan>();

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

  public shared ({ caller }) func configureApiEndpoint(endpoint : ApiEndpoint) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure API endpoint");
    };

    if (endpoint.isEmpty()) { Runtime.trap("Invalid endpoint supplied") };
    apiEndpoint := endpoint;
  };

  public shared ({ caller }) func configureApiKey(key : ApiKey) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure API key");
    };

    if (key.isEmpty()) { Runtime.trap("Invalid API key supplied") };
    apiKey := key;
  };

  public query ({ caller }) func getApiEndpoint() : async ApiEndpoint {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view API endpoint");
    };
    apiEndpoint;
  };

  public query ({ caller }) func getApiKey() : async ApiKey {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view API key");
    };
    apiKey;
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

    if (apiEndpoint.isEmpty()) { Runtime.trap("API endpoint not configured") };
    if (apiKey.isEmpty()) { Runtime.trap("API key not configured") };

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
};
