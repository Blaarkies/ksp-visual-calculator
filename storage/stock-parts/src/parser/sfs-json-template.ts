export const pegSfs =
`
{
  function overlapKvPairToList(kvList) {
    return kvList.reduce((sum, c) => {
      let key = c[0];
      let value = c[1];
      if (!sum[key]) {
        sum[key] = [];
      }
      if (Object.keys(value).length) {
      sum[key].push(value);
      }
      return sum;
    }, {});
  }

  function combineMemberFields(members) {
    let fields = members.filter(m => m.isField).map(m => m.data);
    let fieldsObject = overlapKvPairToList(fields);

    let sections = members.filter(m => !m.isField).map(m => m.data);
    let sectionsObject = overlapKvPairToList(sections);

    return {...fieldsObject, ...sectionsObject};
  }
}

readFile = sections:section* eol* (!.) {return overlapKvPairToList(sections)}

section = k:key trim? eol
          ws? open (('\\t' / ' ')*)? eol
          values:(ws? (
            data:'//' string {return {isComment: true}}
            / data:section   {return {isField: false, data}}
            / data:field     {return {isField: true, data}}
          ))*
          ws? close eol? {
            let members = values.map(v => v[1]).filter(m => !m.isComment);
            return [k, combineMemberFields(members)];
         }

field = k:key trim '=' trim v:string eol { return [k, v] }

key = v:([0-9a-zA-Z_] / '/')+ { return v.join('') }
string = v:char* { return v.join('') }
char = [^\\n\\r]

open  = '{'
close = '}'
eol   = [\\n\\r]
ws    = [ \\t\\n\\r]+
trim  = ' '?
`;
