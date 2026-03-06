import Array "mo:core/Array";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply data migration on upgrade
(with migration = Migration.run)
actor {
  module Client {
    public func compareByCreatedAt(client1 : Client, client2 : Client) : Order.Order {
      Int.compare(client1.createdAt, client2.createdAt);
    };
  };

  public type Client = {
    id : Nat;
    name : Text;
    age : Nat;
    riskProfile : Text;
    monthlyIncome : Float;
    monthlyExpenses : Float;
    currentSavings : Float;
    targetCorpus : Float;
    retirementAge : Nat;
    currentAge : Nat;
    goals : Text;
    createdAt : Int;
    owner : Principal; // Track ownership
  };

  public type SimulationResult = {
    percentile10 : [Float];
    percentile50 : [Float];
    percentile90 : [Float];
    successProbability : Float;
  };

  public type SIPResult = {
    requiredMonthlySIP : Float;
    sipGap : Float;
    feasibilityScore : Float;
  };

  public type StressTestResult = {
    scenario : Text;
    adjustedCorpus : Float;
    adjustedSIP : Float;
    impactPercentage : Float;
  };

  public type AdvisorStats = {
    totalClients : Nat;
    totalAUM : Float;
    avgCorpusTarget : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  let clients = Map.empty<Nat, Client>();
  var nextId = 1;

  // Include Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func autoRegisterAndCheck(caller : Principal, requiredRole : AccessControl.UserRole) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access this resource");
    };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { accessControlState.userRoles.add(caller, #user) };
      case (?_) {};
    };
    if (not AccessControl.hasPermission(accessControlState, caller, requiredRole)) {
      Runtime.trap("Unauthorized: Insufficient permissions");
    };
  };

  // Check if caller owns the client or is admin
  func checkClientOwnership(caller : Principal, clientId : Nat) : Bool {
    switch (clients.get(clientId)) {
      case (null) { false };
      case (?client) {
        client.owner == caller or AccessControl.isAdmin(accessControlState, caller)
      };
    };
  };

  // User Profile Management
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    // Users can only view their own profile, admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    autoRegisterAndCheck(caller, #user);
    userProfiles.add(caller, profile);
  };

  // Add new client
  public shared ({ caller }) func addClient(
    name : Text,
    age : Nat,
    riskProfile : Text,
    monthlyIncome : Float,
    monthlyExpenses : Float,
    currentSavings : Float,
    targetCorpus : Float,
    retirementAge : Nat,
    currentAge : Nat,
    goals : Text,
  ) : async Nat {
    autoRegisterAndCheck(caller, #user);

    let id = nextId;
    nextId += 1;

    let createdAt = Time.now();

    let client : Client = {
      id;
      name;
      age;
      riskProfile;
      monthlyIncome;
      monthlyExpenses;
      currentSavings;
      targetCorpus;
      retirementAge;
      currentAge;
      goals;
      createdAt;
      owner = caller;
    };

    clients.add(id, client);
    id;
  };

  // Get single client
  public query ({ caller }) func getClient(id : Nat) : async ?Client {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access clients");
    };

    // Check ownership
    if (not checkClientOwnership(caller, id)) {
      Runtime.trap("Unauthorized: You can only access your own clients");
    };

    clients.get(id);
  };

  // List all clients (only caller's clients, or all if admin)
  public query ({ caller }) func listClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list clients");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let filteredClients = if (isAdmin) {
      // Admins see all clients
      clients.values().toArray();
    } else {
      // Regular users see only their own clients
      clients.values().toArray().filter(func(c : Client) : Bool {
        c.owner == caller
      });
    };

    filteredClients.sort(Client.compareByCreatedAt);
  };

  // Update client
  public shared ({ caller }) func updateClient(
    id : Nat,
    name : Text,
    age : Nat,
    riskProfile : Text,
    monthlyIncome : Float,
    monthlyExpenses : Float,
    currentSavings : Float,
    targetCorpus : Float,
    retirementAge : Nat,
    currentAge : Nat,
    goals : Text,
  ) : async Bool {
    autoRegisterAndCheck(caller, #user);

    // Check ownership
    if (not checkClientOwnership(caller, id)) {
      Runtime.trap("Unauthorized: You can only update your own clients");
    };

    switch (clients.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated : Client = {
          id;
          name;
          age;
          riskProfile;
          monthlyIncome;
          monthlyExpenses;
          currentSavings;
          targetCorpus;
          retirementAge;
          currentAge;
          goals;
          createdAt = existing.createdAt;
          owner = existing.owner; // Preserve owner
        };
        clients.add(id, updated);
        true;
      };
    };
  };

  // Delete client
  public shared ({ caller }) func deleteClient(id : Nat) : async Bool {
    autoRegisterAndCheck(caller, #user);

    // Check ownership
    if (not checkClientOwnership(caller, id)) {
      Runtime.trap("Unauthorized: You can only delete your own clients");
    };

    if (clients.containsKey(id)) {
      clients.remove(id);
      true;
    } else {
      false;
    };
  };

  // SIP Calculation (simplified)
  public query ({ caller }) func calculateSIP(
    targetCorpus : Float,
    currentSavings : Float,
    years : Nat,
    annualReturn : Float,
    inflationRate : Float,
  ) : async SIPResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate SIP");
    };

    let realReturn = ((1.0 + annualReturn) / (1.0 + inflationRate)) - 1.0;
    let totalMonths = years * 12;
    let totalMonthsFloat = totalMonths.toFloat();

    let futureValue = currentSavings * Float.pow(1.0 + realReturn, years.toFloat());
    let requiredSip = (targetCorpus - futureValue) / (
    (((Float.pow(1.0 + realReturn, years.toFloat())) - 1.0) / (realReturn)) * Float.pow(1.0 + realReturn, -1.0 / 12.0)
    );

    let sipGap = requiredSip - (targetCorpus / totalMonthsFloat);
    let feasibility = if (requiredSip <= 0.0) { 1.0 } else { 1.0 / (1.0 + Float.abs(requiredSip / targetCorpus)) };

    {
      requiredMonthlySIP = requiredSip;
      sipGap;
      feasibilityScore = feasibility;
    };
  };

  // Run Monte Carlo Simulation (dummy implementation)
  public query ({ caller }) func runMonteCarloSimulation(
    initialCorpus : Float,
    monthlySIP : Float,
    years : Nat,
    _meanReturn : Float,
    _stdDev : Float,
    _simCount : Nat,
  ) : async SimulationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run simulations");
    };

    let payback = initialCorpus + (monthlySIP * (years.toFloat() * 12.0));
    let values = Array.tabulate(10, func(i) { payback * ((i + 1).toFloat()) });
    {
      percentile10 = values;
      percentile50 = values;
      percentile90 = values;
      successProbability = 0.5;
    };
  };

  // Apply stress test (dummy)
  public shared ({ caller }) func applyStressTest(clientId : Nat, scenario : Text) : async ?StressTestResult {
    autoRegisterAndCheck(caller, #user);

    // Check ownership of the client
    if (not checkClientOwnership(caller, clientId)) {
      Runtime.trap("Unauthorized: You can only run stress tests on your own clients");
    };

    ?{
      scenario;
      adjustedCorpus = 0.0;
      adjustedSIP = 0.0;
      impactPercentage = 0.0;
    };
  };

  // Get advisor stats (only for caller's clients, or all if admin)
  public query ({ caller }) func getAdvisorStats() : async AdvisorStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access stats");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let relevantClients = if (isAdmin) {
      clients.values().toArray();
    } else {
      clients.values().toArray().filter(func(c : Client) : Bool {
        c.owner == caller
      });
    };

    let totalClients = relevantClients.size();
    let totalAUM = relevantClients.foldLeft(0.0, func(aum, c) { aum + c.currentSavings });
    let avgCorpusTarget = if (totalClients == 0) { 0.0 } else {
      let totalTargets = relevantClients.foldLeft(0.0, func(sum, c) { sum + c.targetCorpus });
      totalTargets / (totalClients.toFloat());
    };

    {
      totalClients;
      totalAUM;
      avgCorpusTarget;
    };
  };
};
