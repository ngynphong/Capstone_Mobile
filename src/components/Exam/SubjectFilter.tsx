import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Subject } from '../../types/subjectTypes';

interface SubjectFilterProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectSelect: (subject: string) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({
  subjects,
  selectedSubject,
  onSubjectSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
      className="mb-2"
    >
      {subjects.map((subject) => (
        <TouchableOpacity
          key={subject.id}
          onPress={() => onSubjectSelect(subject.name)}
          className={`px-4 py-2 rounded-full border ${
            selectedSubject === subject.name
              ? 'bg-teal-400 border-teal-400'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`font-medium text-sm ${
              selectedSubject === subject.name
                ? 'text-white'
                : 'text-gray-700'
            }`}
          >
            {subject.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default SubjectFilter;
