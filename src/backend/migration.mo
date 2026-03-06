import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type OldClient = {
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
    owner : Principal;
  };

  type OldActor = {
    clients : Map.Map<Nat, OldClient>;
    nextId : Nat;
  };

  type NewClient = {
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
    owner : Principal;
  };

  type NewActor = {
    clients : Map.Map<Nat, NewClient>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
