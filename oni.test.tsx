import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OniWarriorArt } from './meta';
it('renders custom red Oni artwork instead of a device emoji',()=>{
 const html=renderToStaticMarkup(<OniWarriorArt/>);
 expect(html).toContain('Red Oni warrior');
 expect(html).toContain('<path');
 expect(html).not.toContain('👹');
});
