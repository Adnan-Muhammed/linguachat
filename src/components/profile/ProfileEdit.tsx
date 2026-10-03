import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useApp } from '@/context/AppContext';
import { GENDERS, MOBILE_RE, USERNAME_RE } from '@/lib/utils';
import Field from '../ui/Field';

interface Form {
  name: string;
  username: string;
  age: string;
  gender: string;
  mobile: string;
}

export default function ProfileEdit({ onDone }: { onDone: () => void }) {
  const { db, saveProfile, toast } = useApp();
  const me = db.me;
  const [f, setF] = useState<Form>({
    name: me?.name ?? '',
    username: me?.username ?? '',
    age: String(me?.age ?? ''),
    gender: me?.gender ?? GENDERS[0],
    mobile: me?.mobile ?? '',
  });

  if (!me) return null;

  const set =
    (k: keyof Form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = Object.fromEntries(
      Object.entries(f).map(([k, x]) => [k, x.trim()])
    ) as Form;

    if (
      !USERNAME_RE.test(v.username) ||
      !MOBILE_RE.test(v.mobile)
    )
      return toast('Check the highlighted details');

    saveProfile({
      name: v.name,
      username: v.username,
      age: +v.age,
      gender: v.gender,
      mobile: v.mobile,
    });
    onDone();
  };

  return (
    <div className="pwrap">
      <form className="pcard form" onSubmit={submit} noValidate>
        <h2>Edit profile</h2>
        {me.avatar_url && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img src={me.avatar_url} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%' }} />
          </div>
        )}
        {me.email && (
          <Field id="eEmail" label="Email">
            <input id="eEmail" value={me.email} disabled />
          </Field>
        )}
        <Field id="eName" label="Name">
          <input id="eName" value={f.name} disabled />
        </Field>
        <Field id="eUser" label="Username">
          <input id="eUser" value={f.username} onChange={set('username')} />
        </Field>
        <div className="row2">
          <Field id="eAge" label="Age">
            <input id="eAge" type="number" value={f.age} disabled />
          </Field>
          <Field id="eGender" label="Gender">
            <select id="eGender" value={f.gender} disabled>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <Field id="eMobile" label="Mobile number">
          <input id="eMobile" type="tel" value={f.mobile} onChange={set('mobile')} />
        </Field>
        <div className="pacts">
          <button className="btn" type="submit">Save changes</button>
          <button className="btn ghost" type="button" onClick={onDone}>Cancel</button>
        </div>
      </form>
    </div>
  );
}