import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  birthProfileInputSchema,
  type BirthProfileInput,
} from '../domain/birthProfile';
import { searchCities, type City } from '../domain/cities';
import { formatIsoDate, formatIsoTime, parseIsoDate, parseIsoTime } from '../domain/time';
import { useI18n } from '../i18n/I18n';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { PrimaryButton } from './Buttons';
import { ChoiceRow, Field } from './Field';

const empty: BirthProfileInput = {
  fullName: '',
  birthDate: '1990-01-01',
  timePrecision: 'exact',
  birthTime: null,
  cityId: null,
  cityLabel: '',
  country: '',
  timeZone: null,
  latitude: null,
  longitude: null,
  gender: 'unspecified',
};

export function BirthDetailsForm({
  initial,
  onSubmit,
}: {
  initial?: BirthProfileInput;
  onSubmit: (value: BirthProfileInput) => void;
}) {
  const { t } = useI18n();
  const theme = useTheme();
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [query, setQuery] = useState(initial?.cityLabel ?? '');
  const form = useForm<BirthProfileInput>({
    resolver: zodResolver(birthProfileInputSchema),
    defaultValues: initial ?? empty,
  });
  const timePrecision = form.watch('timePrecision');
  const cityId = form.watch('cityId');
  const matches = searchCities(query);

  function applyCity(city: City) {
    form.setValue('cityId', city.id, { shouldValidate: true });
    form.setValue('cityLabel', city.label, { shouldValidate: true });
    form.setValue('country', city.country, { shouldValidate: true });
    form.setValue('timeZone', city.timeZone, { shouldValidate: true });
    form.setValue('latitude', city.latitude, { shouldValidate: true });
    form.setValue('longitude', city.longitude, { shouldValidate: true });
    setQuery(city.label);
  }

  function keepUnresolved() {
    form.setValue('cityId', null);
    form.setValue('cityLabel', query.trim(), { shouldValidate: true });
    form.setValue('timeZone', null);
    form.setValue('latitude', null);
    form.setValue('longitude', null);
  }

  return (
    <View style={styles.form}>
      <Controller
        control={form.control}
        name="fullName"
        render={({ field, fieldState }) => (
          <Field
            label={t('fullName')}
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <View style={styles.block}>
        <AppText variant="label">{t('birthDate')}</AppText>
        <Pressable
          onPress={() => setPicker('date')}
          style={[styles.fake, { borderColor: theme.line, backgroundColor: theme.card }]}
        >
          <AppText>{form.watch('birthDate')}</AppText>
        </Pressable>
      </View>

      <View style={styles.block}>
        <AppText variant="label">{t('birthTime')}</AppText>
        <ChoiceRow
          value={timePrecision}
          onChange={(id) => {
            const next = id === 'unknown' ? 'unknown' : 'exact';
            form.setValue('timePrecision', next, { shouldValidate: true });
            if (next === 'unknown') {
              form.setValue('birthTime', null, { shouldValidate: true });
            }
          }}
          options={[
            { id: 'exact', label: t('timeExact') },
            { id: 'unknown', label: t('timeUnknown') },
          ]}
        />
        {timePrecision === 'exact' ? (
          <Pressable
            onPress={() => setPicker('time')}
            style={[styles.fake, { borderColor: theme.line, backgroundColor: theme.card }]}
          >
            <AppText>{form.watch('birthTime') ?? '--:--'}</AppText>
          </Pressable>
        ) : null}
        {form.formState.errors.birthTime ? (
          <AppText variant="muted" style={{ color: theme.danger }}>
            {form.formState.errors.birthTime.message}
          </AppText>
        ) : null}
      </View>

      {picker ? (
        <DateTimePicker
          value={
            picker === 'date'
              ? parseIsoDate(form.getValues('birthDate'))
              : parseIsoTime(form.getValues('birthTime') ?? '12:00')
          }
          mode={picker}
          maximumDate={picker === 'date' ? new Date() : undefined}
          minimumDate={picker === 'date' ? new Date(1900, 0, 1) : undefined}
          onChange={(event, selected) => {
            if (event.type === 'dismissed') {
              setPicker(null);
              return;
            }
            if (selected) {
              if (picker === 'date') {
                form.setValue('birthDate', formatIsoDate(selected), { shouldValidate: true });
              } else {
                form.setValue('birthTime', formatIsoTime(selected), { shouldValidate: true });
              }
            }
            setPicker(null);
          }}
        />
      ) : null}

      <Field
        label={t('city')}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (text.trim() !== form.getValues('cityLabel')) {
            form.setValue('cityId', null);
            form.setValue('latitude', null);
            form.setValue('longitude', null);
            form.setValue('timeZone', null);
          }
        }}
        autoCapitalize="words"
      />
      <AppText variant="muted">{t('cityHint')}</AppText>
      <View style={styles.matches}>
        {matches.map((city) => (
          <Pressable key={city.id} onPress={() => applyCity(city)} style={styles.match}>
            <AppText>
              {city.label}
              <AppText variant="muted">  {city.country}</AppText>
            </AppText>
          </Pressable>
        ))}
        {query.trim().length > 1 ? (
          <Pressable onPress={keepUnresolved}>
            <AppText variant="muted" style={{ color: theme.gold }}>
              {t('useUnresolved')}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {!cityId ? (
        <Controller
          control={form.control}
          name="country"
          render={({ field, fieldState }) => (
            <Field
              label={t('country')}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      ) : (
        <AppText variant="muted">
          {form.watch('country')} · {form.watch('timeZone')}
        </AppText>
      )}
      {!cityId ? <AppText variant="muted">{t('unresolvedNote')}</AppText> : null}

      <View style={styles.block}>
        <AppText variant="label">{t('gender')}</AppText>
        <AppText variant="muted">{t('genderOptional')}</AppText>
        <Controller
          control={form.control}
          name="gender"
          render={({ field }) => (
            <ChoiceRow
              value={field.value}
              onChange={(id) => field.onChange(id)}
              options={[
                { id: 'female', label: t('female') },
                { id: 'male', label: t('male') },
                { id: 'other', label: t('other') },
                { id: 'unspecified', label: t('unspecified') },
              ]}
            />
          )}
        />
      </View>

      {form.formState.errors.birthDate ? (
        <AppText variant="muted" style={{ color: theme.danger }}>
          {form.formState.errors.birthDate.message}
        </AppText>
      ) : null}

      <PrimaryButton label={t('save')} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  block: {
    gap: 8,
  },
  fake: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  matches: {
    gap: 10,
  },
  match: {
    paddingVertical: 4,
  },
});
