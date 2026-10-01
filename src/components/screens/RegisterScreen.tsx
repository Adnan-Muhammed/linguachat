import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useApp } from '@/context/AppContext';
import { GENDERS, MOBILE_RE, USERNAME_RE } from '@/lib/utils';
import Field from '../ui/Field';
import ThemeToggle from '../ui/ThemeToggle';

const INITIAL = { name: 'Alex Morgan', username: '', age: '', gender: '', mobile: '' };
type Form = typeof INITIAL;
type Errors = Partial<Record<keyof Form, string>>;

export default function RegisterScreen() {
  const { registerUser } = useApp();
  const [f, setF] = useState<Form>(INITIAL);
  const [errs, setErrs] = useState<Errors>({});

  const set =
    (k: keyof Form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = Object.fromEntries(
      Object.entries(f).map(([k, x]) => [k, x.trim()])
    ) as Form;

    const rules: Record<keyof Form, [boolean, string]> = {
      name: [v.name.length >= 2, 'Enter your name'],
      username: [USERNAME_RE.test(v.username), '3–20 letters, numbers, _ or .'],
      age: [+v.age >= 13 && +v.age <= 120, 'Enter an age between 13 and 120'],
      gender: [!!v.gender, 'Select an option'],
      mobile: [MOBILE_RE.test(v.mobile), 'Enter a valid mobile number'],
    };

    const next: Errors = {};
    (Object.keys(rules) as (keyof Form)[]).forEach((k) => {
      if (!rules[k][0]) next[k] = rules[k][1];
    });
    setErrs(next);
    if (Object.keys(next).length) return;

    registerUser({
      id: 'me',
      name: v.name,
      username: v.username,
      age: +v.age,
      gender: v.gender,
      mobile: v.mobile,
    });
  };

  return (
    <section id="register" className="screen">
      <ThemeToggle />
      <form className="card form" onSubmit={submit} noValidate>
        <h2>Set up your profile</h2>
        <p className="sub">Signed in as alex.morgan@gmail.com</p>

        <Field id="rName" label="Name" error={errs.name}>
          <input id="rName" value={f.name} onChange={set('name')} autoComplete="name" />
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

        <button className="btn" type="submit">Enter app</button>
      </form>
    </section>
  );
}