interface IFaultColor {
  faultI: string;
  faultII: string;
  faultIII: string;
}

interface ISubway {
  line: string;
  station: string;
}

export class Colors implements IFaultColor, ISubway {
  faultI = "#FF7062";
  faultII = "#FCDD80";
  faultIII = "#3CBC88";
  line = "#203C59";
  station = "#1E646E";
}
