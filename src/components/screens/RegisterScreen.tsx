import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useApp } from '@/context/AppContext';
import { GENDERS, MOBILE_RE, USERNAME_RE } from '@/lib/utils';
import Field from '../ui/Field';
import ThemeToggle from '../ui/ThemeToggle';

type Form = { name: string; username: string; age: string; gender: string; mobile: string };
type Errors = Partial<Record<keyof Form, string>>;

export default function RegisterScreen() {
  const { db, registerUser } = useApp();
  const email = db.me?.email || 'Signed in via Google';
  const [f, setF] = useState<Form>({
    name: db.me?.name || '',
    username: db.me?.username || '',
    age: db.me?.age ? String(db.me.age) : '',
    gender: db.me?.gender || '',
    mobile: db.me?.mobile || '',
  });
  const [errs, setErrs] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set =
    (k: keyof Form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = Object.fromEntries(
      Object.entries(f).map(([k, x]) => [k, x.trim()])
    ) as Form;

    const rules: Record<keyof Form, [boolean, string]> = {
      name: [v.name.length >= 2, 'Enter your name'],
      username: [USERNAME_RE.test(v.username), '3–20 letters, numbers, _ or .'],
      age: [+v.age >= 13 && +v.age <= 120, 'Enter an age between 13 and 120'],
      gender: [!!v.gender, 'Select an option'],
      mobile: [MOBILE_RE.test(v.mobile), 'Must be exactly 10 digits'],
    };

    const next: Errors = {};
    (Object.keys(rules) as (keyof Form)[]).forEach((k) => {
      if (!rules[k][0]) next[k] = rules[k][1];
    });
    setErrs(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    await registerUser({
      id: db.me?.id || '',
      name: v.name,
      username: v.username,
      age: +v.age,
      gender: v.gender,
      mobile: v.mobile,
      avatar_url: db.me?.avatar_url,
    });
    setSubmitting(false);
  };

  return (
    <section id="register" className="screen">
      <ThemeToggle />
      <form className="card form" onSubmit={submit} noValidate>
        <h2>Set up your profile</h2>
        <p className="sub">Signed in as {email}</p>

        <Field id="rName" label="Name" error={errs.name}>
          <input id="rName" value={f.name} disabled />
        </Field>
        <Field id="rUser" label="Username" error={errs.username}>
          <input id="rUser" value={f.username} onChange={set('username')} placeholder="letters, numbers, _" autoComplete="username" />
        </Field>

        <div className="row2">
          <Field id="rAge" label="Age" error={errs.age}>
            <input id="rAge" type="number" inputMode="numeric" value={f.age} onChange={set('age')} />
          </Field>
          <Field id="rGender" label="Gender" error={errs.gender}>
            <select id="rGender" value={f.gender} onChange={set('gender')}>
              <option value="">Select</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        <Field id="rMobile" label="Mobile number" error={errs.mobile}>
          <input id="rMobile" type="tel" value={f.mobile} onChange={set('mobile')} placeholder="+91 98765 43210" autoComplete="tel" />
        </Field>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Enter app'}
        </button>
      </form>
    </section>
  );
}