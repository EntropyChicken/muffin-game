class Quantity {
  static PLACES = 27;
  static FACTOR = 1000000000000000000000000000n; // 10^27

  constructor(bigIntValue) {
    if (typeof bigIntValue !== 'bigint') {
      throw new TypeError("Use static methods like Quantity.fromString() or Quantity.fromNumber()");
    }
    this.value = bigIntValue;
  }

  static zero() {
    return new Quantity(0n);
  }

  static sanitizeInput(rawInput) {
    if (typeof rawInput !== 'string') rawInput = String(rawInput);
    const clean = rawInput.replace(/\s+/g, '');
    const validNumRegex = /^\d+(\.\d+)?$/;
    return validNumRegex.test(clean) ? clean : "";
  }

  static fromString(rawInput) {
    const clean = Quantity.sanitizeInput(rawInput);
    if (!clean) return Quantity.zero();
    const [integerPart, decimalPart = ""] = clean.split(".");
    const paddedDecimal = decimalPart.padEnd(Quantity.PLACES, "0").slice(0, Quantity.PLACES);
    return new Quantity(BigInt(integerPart + paddedDecimal));
  }

  static fromNumber(num) {
    if (!Number.isFinite(num)) return Quantity.zero();
    return Quantity.fromString(num.toFixed(Quantity.PLACES));
  }

  static fromJSON(value) {
    if (value instanceof Quantity) return value;
    if (typeof value === 'string') return Quantity.fromString(value);
    if (typeof value === 'number') return Quantity.fromNumber(value);
    return Quantity.zero();
  }

  add(other) { return new Quantity(this.value + other.value); }
  subtract(other) { return new Quantity(this.value - other.value); }
  multiplyByInt(multiplier) { return new Quantity(this.value * BigInt(multiplier)); }

  multiplyByFloat(f) {
    const floatScale = 1000000000n;
    const floatVal = BigInt(Math.round(f * 1000000000));
    return new Quantity((this.value * floatVal) / floatScale);
  }

  divideByFloat(f) {
    if (f === 0) return Quantity.zero();
    const floatScale = 1000000000n;
    const floatVal = BigInt(Math.round(f * 1000000000));
    return new Quantity((this.value * floatScale) / floatVal);
  }

  divideByInt(divisor) {
    if (divisor === 0) return Quantity.zero();
    const divisorBig = BigInt(divisor);
    const quotient = this.value / divisorBig;
    const remainder = this.value % divisorBig;
    const rounded = remainder * 2n >= divisorBig ? quotient + 1n : quotient;
    return new Quantity(rounded);
  }

  isEqualTo(other) { return this.value === other.value; }
  isGreaterThan(other) { return this.value > other.value; }
  isGreaterThanOrEqualTo(other) { return this.value >= other.value; }
  isLessThan(other) { return this.value < other.value; }
  isLessThanOrEqualTo(other) { return this.value <= other.value; }
  isZero() { return this.value === 0n; }
  exceedsSix() { return this.value > (6n * Quantity.FACTOR); }

  toNumber() { return Number(this.value) / Number(Quantity.FACTOR); }
  toString() {
    const isNegative = this.value < 0n;
    const absoluteValue = isNegative ? -this.value : this.value;
    const absoluteValueStr = absoluteValue.toString();
    const paddedStr = absoluteValueStr.padStart(Quantity.PLACES + 1, "0");
    const integerPart = paddedStr.slice(0, -Quantity.PLACES);
    const decimalPart = paddedStr.slice(-Quantity.PLACES);
    return `${isNegative ? "-" : ""}${integerPart}.${decimalPart}`;
  }

  toDisplayString() {
    const raw = this.toString();
    if (!raw.includes(".")) return raw;
    const [integerPart, decimalPart = ""] = raw.split(".");
    const trimmedDecimal = decimalPart.replace(/0+$/, "");
    if (!trimmedDecimal) return integerPart;
    return `${integerPart}.${trimmedDecimal}`;
  }

  toJSON() { return this.toString(); }
}