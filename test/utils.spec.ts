const expect = require('chai').expect;
import {parseArgs} from '../processors/utils';

describe('utils', () => {
  describe('parseArgs', () => {
    it('should parse args with no quotes', () => {
      expect(parseArgs('a,b,c')).to.eql(['a', 'b', 'c']);
    });
    it('should trim whitespace', () => {
      expect(parseArgs('a, b , c')).to.eql(['a', 'b', 'c']);
    });
    it('should parse args wrapped in quotes', () => {
      expect(parseArgs('"a",\'b\',`c`')).to.eql(['a', 'b', 'c']);
    });
    it('should parse args containing quotes', () => {
      expect(parseArgs('"\'a,b\'",\'b, "c"\',`d`')).to.eql(['\'a,b\'', 'b, "c"', 'd']);
    });
    it('should parse args with quotes containing commas', () => {
      expect(parseArgs('"a,b",\'c,d\'')).to.eql(['a,b', 'c,d']);
    });
    it('should ignore escaped quotes', () => {
      expect(parseArgs('\'a\\\'b\', "a\\"b", `a\\`b`')).to.eql(['a\'b', 'a"b', 'a`b']);
    });
    it('should ignore quotes inside non-quoted args', () => {
      expect(parseArgs('a\'s b, c\'s d')).to.eql(['a\'s b', 'c\'s d']);
    });
    it('should handle empty args', () => {
      expect(parseArgs(',')).to.eql(['', '']);
      expect(parseArgs(',,')).to.eql(['', '', '']);
      expect(parseArgs('v1,,,')).to.eql(['v1', '', '', '']);
      expect(parseArgs(',a,b')).to.eql(['', 'a', 'b']);
      expect(parseArgs('a,b,')).to.eql(['a', 'b', '']);
      expect(parseArgs('a,`b`,')).to.eql(['a', 'b', '']);
      expect(parseArgs('a,`b`,\n')).to.eql(['a', 'b', '']);
    });

    it('should handle newlines in args', () => {
      expect(parseArgs('`a`,\nb,\n`c,\nd`')).to.eql(['a', 'b', 'c,\nd']);
    });
  });
});
