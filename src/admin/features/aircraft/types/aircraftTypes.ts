import type {
  AirplaneType,
  AirplaneTypeStatus,
  CreateAirplaneTypeRequest,
  UpdateAirplaneTypeCapacityRequest,
  CorrectAirplaneTypeIdentityRequest,
} from "./airplaneTypeTypes";

export type AircraftStatus = AirplaneTypeStatus;
export type AircraftType = AirplaneType;

export type AircraftStatusAction = "ACTIVATE" | "DEACTIVATE" | "RETIRE";

export type CreateAircraftDTO = CreateAirplaneTypeRequest;
export type UpdateAircraftCapacityDTO = UpdateAirplaneTypeCapacityRequest;
export type CorrectIdentityAircraftDTO = CorrectAirplaneTypeIdentityRequest;
